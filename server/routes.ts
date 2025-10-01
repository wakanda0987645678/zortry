import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScrapedContentSchema, insertCoinSchema } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";

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

      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract metadata
      const title = $('title').text().trim() || 
                    $('meta[property="og:title"]').attr('content') || 
                    $('h1').first().text().trim() || 
                    'Untitled';

      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || 
                         '';

      const author = $('meta[name="author"]').attr('content') || 
                     $('meta[property="article:author"]').attr('content') || 
                     $('[rel="author"]').text().trim() || 
                     '';

      const publishDate = $('meta[property="article:published_time"]').attr('content') || 
                         $('meta[name="publishdate"]').attr('content') || 
                         $('time').attr('datetime') || 
                         '';

      const image = $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="twitter:image"]').attr('content') || 
                    $('img').first().attr('src') || 
                    '';

      // Extract main content
      let content = '';
      const contentSelectors = [
        'article',
        '[role="main"]',
        '.post-content',
        '.entry-content',
        '.content',
        '.article-body',
        '.story-body',
        '.post-body',
        'main',
        '.main-content'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          element.find('script, style, nav, footer, header, .sidebar, .comments, .social-share, .advertisement, .ad').remove();
          content = element.text().trim();
          if (content.length > 100) {
            break;
          }
        }
      }

      if (!content || content.length < 100) {
        $('script, style, nav, footer, header, .sidebar, .comments, .social-share, .advertisement, .ad').remove();
        content = $('body').text().trim();
      }

      content = content.replace(/\s+/g, ' ').trim();

      const tags = $('meta[name="keywords"]').attr('content')?.split(',').map(tag => tag.trim()) || [];

      const scrapedData = {
        url,
        title,
        description,
        author,
        publishDate,
        image,
        content: content.substring(0, 10000),
        tags,
      };

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

  const httpServer = createServer(app);
  return httpServer;
}
