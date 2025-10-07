import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScrapedContentSchema, insertCoinSchema, updateCoinSchema, insertCommentSchema, insertNotificationSchema } from "@shared/schema";
import axios from "axios";
import { detectPlatform } from "./platform-detector";
import { scrapeByPlatform } from "./platform-scrapers";
import { migrateOldData } from "./migrate-old-data";
import { sendTelegramNotification } from "./telegram-bot";
import { RegistryService } from "./registry-service";
import { base } from "viem/chains";
import { handleFileUpload } from "./upload-handler"; // Import the upload handler

export async function registerRoutes(app: Express): Promise<Server> {

  // File upload endpoint
  app.post("/api/upload", handleFileUpload);

  // Scrape URL endpoint
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Detect platform
      const platformInfo = detectPlatform(url);

      // Scrape content using platform-specific logic
      const scrapedData = await scrapeByPlatform(url, platformInfo.type);

      // Validate and store
      const validatedData = insertScrapedContentSchema.parse(scrapedData);
      const stored = await storage.createScrapedContent(validatedData);

      res.json(stored);

    } catch (error) {
      console.error('Scraping error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return res.status(408).json({
            error: 'Request timeout - the page took too long to load'
          });
        }
        if (error.response?.status === 404) {
          return res.status(404).json({
            error: 'Page not found - please check the URL is correct'
          });
        }
        if (error.response?.status === 403) {
          return res.status(403).json({
            error: 'Access forbidden - this platform blocks automated access'
          });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({
            error: 'Rate limit exceeded - Instagram and TikTok often block scrapers. Try YouTube, Medium, or blog URLs instead.'
          });
        }
      }

      res.status(500).json({
        error: 'Failed to scrape content - some platforms block automated access. Try a different URL or platform.'
      });
    }
  });

  // Get all coins
  app.get("/api/coins", async (_req, res) => {
    try {
      const coins = await storage.getAllCoins();
      res.json(coins);
    } catch (error) {
      console.error('Get coins error:', error);
      res.status(500).json({ error: 'Failed to fetch coins' });
    }
  });

  // Get coins by creator
  app.get("/api/coins/creator/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const coins = await storage.getCoinsByCreator(address);
      res.json(coins);
    } catch (error) {
      console.error('Get creator coins error:', error);
      res.status(500).json({ error: 'Failed to fetch creator coins' });
    }
  });

  // Create coin
  app.post("/api/coins", async (req, res) => {
    try {
      const validatedData = insertCoinSchema.parse(req.body);
      const coin = await storage.createCoin(validatedData);

      // Auto-create or update creator
      let creator = await storage.getCreatorByAddress(coin.creator);
      if (!creator) {
        // Create new creator
        creator = await storage.createCreator({
          address: coin.creator,
          totalCoins: '1',
          totalVolume: '0',
          followers: '0',
        });
      } else {
        // Update existing creator's coin count
        const newTotalCoins = (parseInt(creator.totalCoins) + 1).toString();
        await storage.updateCreator(creator.id, {
          totalCoins: newTotalCoins,
        });
      }

      res.json(coin);
    } catch (error) {
      console.error('Create coin error:', error);
      res.status(400).json({ error: 'Invalid coin data' });
    }
  });

  // Update coin
  app.patch("/api/coins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateCoinSchema.parse(req.body);
      const coin = await storage.updateCoin(id, validatedData);
      if (!coin) {
        return res.status(404).json({ error: 'Coin not found' });
      }
      res.json(coin);
    } catch (error) {
      console.error('Update coin error:', error);
      res.status(400).json({ error: 'Invalid update data' });
    }
  });

  // Get coin by address
  app.get("/api/coins/address/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const coin = await storage.getCoinByAddress(address);
      if (!coin) {
        return res.status(404).json({ error: 'Coin not found' });
      }
      res.json(coin);
    } catch (error) {
      console.error('Get coin error:', error);
      res.status(500).json({ error: 'Failed to fetch coin' });
    }
  });

  // Migrate old data endpoint
  app.post("/api/migrate", async (_req, res) => {
    try {
      const result = await migrateOldData();
      res.json(result);
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({ error: 'Migration failed' });
    }
  });

  // Get all rewards
  app.get("/api/rewards", async (_req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error) {
      console.error('Get rewards error:', error);
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  });

  // Get rewards by coin
  app.get("/api/rewards/coin/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const rewards = await storage.getRewardsByCoin(address);
      res.json(rewards);
    } catch (error) {
      console.error('Get coin rewards error:', error);
      res.status(500).json({ error: 'Failed to fetch coin rewards' });
    }
  });

  // Get rewards by recipient
  app.get("/api/rewards/recipient/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const rewards = await storage.getRewardsByRecipient(address);
      res.json(rewards);
    } catch (error) {
      console.error('Get recipient rewards error:', error);
      res.status(500).json({ error: 'Failed to fetch recipient rewards' });
    }
  });

  // Record a new reward
  app.post("/api/rewards", async (req, res) => {
    try {
      const rewardData = {
        type: req.body.type, // 'platform' or 'trade'
        coinAddress: req.body.coinAddress,
        coinSymbol: req.body.coinSymbol,
        transactionHash: req.body.transactionHash,
        rewardAmount: req.body.rewardAmount, // In wei as string
        rewardCurrency: req.body.rewardCurrency || 'ZORA',
        recipientAddress: req.body.recipientAddress,
      };

      const reward = await storage.createReward(rewardData);
      res.json(reward);
    } catch (error) {
      console.error('Create reward error:', error);
      res.status(400).json({ error: 'Invalid reward data' });
    }
  });

  // Get all creators
  app.get("/api/creators", async (req, res) => {
    try {
      const creators = await storage.getAllCreators();
      res.json(creators);
    } catch (error) {
      console.error('Get creators error:', error);
      res.status(500).json({ error: 'Failed to fetch creators' });
    }
  });

  // Get top creators
  app.get("/api/creators/top", async (req, res) => {
    try {
      const creators = await storage.getTopCreators();
      res.json(creators);
    } catch (error) {
      console.error('Get top creators error:', error);
      res.status(500).json({ error: 'Failed to fetch top creators' });
    }
  });

  // Get creator by address
  app.get("/api/creators/address/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const creator = await storage.getCreatorByAddress(address);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      res.json(creator);
    } catch (error) {
      console.error('Get creator error:', error);
      res.status(500).json({ error: 'Failed to fetch creator' });
    }
  });

  // Create or update creator
  app.post("/api/creators", async (req, res) => {
    try {
      const { address } = req.body;

      // Check if creator already exists
      const existingCreator = await storage.getCreatorByAddress(address);
      if (existingCreator) {
        return res.json(existingCreator);
      }

      // Create new creator
      const creatorData = {
        address: req.body.address,
        name: req.body.name || null,
        bio: req.body.bio || null,
        avatar: req.body.avatar || null,
        verified: req.body.verified || 'false',
        totalCoins: req.body.totalCoins || '0',
        totalVolume: req.body.totalVolume || '0',
        followers: req.body.followers || '0',
      };

      const creator = await storage.createCreator(creatorData);
      res.json(creator);
    } catch (error) {
      console.error('Create creator error:', error);
      res.status(400).json({ error: 'Invalid creator data' });
    }
  });

  // Update creator
  app.patch("/api/creators/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        name: req.body.name,
        bio: req.body.bio,
        avatar: req.body.avatar,
        verified: req.body.verified,
        totalCoins: req.body.totalCoins,
        totalVolume: req.body.totalVolume,
        followers: req.body.followers,
      };

      const creator = await storage.updateCreator(id, updateData);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      res.json(creator);
    } catch (error) {
      console.error('Update creator error:', error);
      res.status(400).json({ error: 'Invalid update data' });
    }
  });

  // Get all comments
  app.get("/api/comments", async (_req, res) => {
    try {
      const comments = await storage.getAllComments();
      res.json(comments);
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  // Get comments by coin address
  app.get("/api/comments/coin/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const comments = await storage.getCommentsByCoin(address);
      res.json(comments);
    } catch (error) {
      console.error('Get coin comments error:', error);
      res.status(500).json({ error: 'Failed to fetch coin comments' });
    }
  });

  // Create a comment
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(400).json({ error: 'Invalid comment data' });
    }
  });

  // Get notifications for user
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Get unread notifications for user
  app.get("/api/notifications/:userId/unread", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getUnreadNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Get unread notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch unread notifications' });
    }
  });

  // Create notification
  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);

      // Send Telegram notification if available
      await sendTelegramNotification(
        notification.userId,
        notification.title,
        notification.message,
        notification.type
      );

      res.json(notification);
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(400).json({ error: 'Invalid notification data' });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json(notification);
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // Registry endpoints for onchain verification
  const registryService = new RegistryService(base.id);

  // Manually trigger batch registration of unregistered coins
  app.post("/api/registry/sync", async (_req, res) => {
    try {
      const coins = await storage.getAllCoins();
      const unregisteredCoins = coins.filter(
        coin => coin.address && coin.status === 'active' && !coin.registryTxHash
      );

      if (unregisteredCoins.length === 0) {
        return res.json({
          message: 'No coins to register',
          registered: 0
        });
      }

      const txHash = await registryService.registerCoinsBatch(unregisteredCoins);

      if (txHash) {
        const now = new Date();
        for (const coin of unregisteredCoins) {
          const metadataHash = registryService.generateMetadataHash(coin);
          await storage.updateCoin(coin.id, {
            registryTxHash: txHash,
            metadataHash,
            registeredAt: now,
          });
        }

        return res.json({
          success: true,
          transactionHash: txHash,
          registered: unregisteredCoins.length
        });
      } else {
        return res.status(500).json({
          error: 'Failed to register coins batch'
        });
      }
    } catch (error) {
      console.error('Registry sync error:', error);
      res.status(500).json({ error: 'Failed to sync registry' });
    }
  });

  // Get registry statistics
  app.get("/api/registry/stats", async (_req, res) => {
    try {
      const totalRegistered = await registryService.getTotalCoinsRegistered();
      const allCoins = await storage.getAllCoins();
      const registeredInDb = allCoins.filter(c => c.registryTxHash).length;
      const pendingRegistration = allCoins.filter(
        c => c.address && c.status === 'active' && !c.registryTxHash
      ).length;

      res.json({
        totalOnchain: totalRegistered,
        totalInDb: allCoins.length,
        registeredInDb,
        pendingRegistration,
      });
    } catch (error) {
      console.error('Registry stats error:', error);
      res.status(500).json({ error: 'Failed to fetch registry stats' });
    }
  });

  // Verify if a coin is registered onchain
  app.get("/api/registry/verify/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const isRegistered = await registryService.isPlatformCoin(address);

      const coin = await storage.getCoinByAddress(address);

      res.json({
        address,
        isRegistered,
        registryTxHash: coin?.registryTxHash || null,
        registeredAt: coin?.registeredAt || null,
      });
    } catch (error) {
      console.error('Registry verify error:', error);
      res.status(500).json({ error: 'Failed to verify coin' });
    }
  });

  // Get creator coin count from registry
  app.get("/api/registry/creator/:address/count", async (req, res) => {
    try {
      const { address } = req.params;
      const count = await registryService.getCreatorCoinCount(address);

      res.json({
        creator: address,
        onchainCoinCount: count,
      });
    } catch (error) {
      console.error('Registry creator count error:', error);
      res.status(500).json({ error: 'Failed to fetch creator coin count' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}