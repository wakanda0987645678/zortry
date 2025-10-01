import { type ScrapedContent, type InsertScrapedContent, type Coin, type InsertCoin } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Scraped Content
  getScrapedContent(id: string): Promise<ScrapedContent | undefined>;
  createScrapedContent(content: InsertScrapedContent): Promise<ScrapedContent>;
  getAllScrapedContent(): Promise<ScrapedContent[]>;
  
  // Coins
  getCoin(id: string): Promise<Coin | undefined>;
  getCoinByAddress(address: string): Promise<Coin | undefined>;
  createCoin(coin: InsertCoin): Promise<Coin>;
  getAllCoins(): Promise<Coin[]>;
  getCoinsByCreator(creator: string): Promise<Coin[]>;
}

export class MemStorage implements IStorage {
  private scrapedContent: Map<string, ScrapedContent>;
  private coins: Map<string, Coin>;

  constructor() {
    this.scrapedContent = new Map();
    this.coins = new Map();
  }

  async getScrapedContent(id: string): Promise<ScrapedContent | undefined> {
    return this.scrapedContent.get(id);
  }

  async createScrapedContent(insertContent: InsertScrapedContent): Promise<ScrapedContent> {
    const id = randomUUID();
    const content: ScrapedContent = { 
      ...insertContent,
      image: insertContent.image ?? null,
      content: insertContent.content ?? null,
      description: insertContent.description ?? null,
      author: insertContent.author ?? null,
      publishDate: insertContent.publishDate ?? null,
      tags: insertContent.tags ? [...insertContent.tags] : null,
      id,
      scrapedAt: new Date()
    };
    this.scrapedContent.set(id, content);
    return content;
  }

  async getAllScrapedContent(): Promise<ScrapedContent[]> {
    return Array.from(this.scrapedContent.values());
  }

  async getCoin(id: string): Promise<Coin | undefined> {
    return this.coins.get(id);
  }

  async getCoinByAddress(address: string): Promise<Coin | undefined> {
    return Array.from(this.coins.values()).find(
      (coin) => coin.address.toLowerCase() === address.toLowerCase()
    );
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const id = randomUUID();
    const coin: Coin = { 
      ...insertCoin,
      scrapedContentId: insertCoin.scrapedContentId ?? null,
      ipfsUri: insertCoin.ipfsUri ?? null,
      id,
      createdAt: new Date()
    };
    this.coins.set(id, coin);
    return coin;
  }

  async getAllCoins(): Promise<Coin[]> {
    return Array.from(this.coins.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getCoinsByCreator(creator: string): Promise<Coin[]> {
    return Array.from(this.coins.values()).filter(
      (coin) => coin.creator.toLowerCase() === creator.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
