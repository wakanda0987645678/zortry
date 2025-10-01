import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScrapedContentSchema, insertCoinSchema, updateCoinSchema } from "@shared/schema";
import axios from "axios";
import { detectPlatform } from "./platform-detector";
import { scrapeByPlatform } from "./platform-scrapers";
import { migrateOldData } from "./migrate-old-data";

export async function registerRoutes(app: Express): Promise<Server> {

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
          return res.status(408).json({ error: 'Request timeout' });
        }
        if (error.response?.status === 404) {
          return res.status(404).json({ error: 'Page not found' });
        }
        if (error.response?.status === 403) {
          return res.status(403).json({ error: 'Access forbidden' });
        }
      }

      res.status(500).json({ error: 'Failed to scrape content' });
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

  const httpServer = createServer(app);
  return httpServer;
}