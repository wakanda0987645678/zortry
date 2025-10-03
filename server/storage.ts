import { type ScrapedContent, type InsertScrapedContent, type Coin, type InsertCoin, type UpdateCoin, type Reward, type InsertReward, type Creator, type InsertCreator, type UpdateCreator, type Comment, type InsertComment } from "@shared/schema";
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
  updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined>;
  getAllCoins(): Promise<Coin[]>;
  getCoinsByCreator(creator: string): Promise<Coin[]>;
  
  // Rewards
  getReward(id: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  getAllRewards(): Promise<Reward[]>;
  getRewardsByCoin(coinAddress: string): Promise<Reward[]>;
  getRewardsByRecipient(recipientAddress: string): Promise<Reward[]>;
  
  // Creators
  getCreator(id: string): Promise<Creator | undefined>;
  getCreatorByAddress(address: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: string, update: UpdateCreator): Promise<Creator | undefined>;
  getAllCreators(): Promise<Creator[]>;
  getTopCreators(): Promise<Creator[]>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByCoin(coinAddress: string): Promise<Comment[]>;
  getAllComments(): Promise<Comment[]>;
}

export class MemStorage implements IStorage {
  private scrapedContent: Map<string, ScrapedContent>;
  private coins: Map<string, Coin>;
  private rewards: Map<string, Reward>;
  private creators: Map<string, Creator>;
  private comments: Map<string, Comment>;

  constructor() {
    this.scrapedContent = new Map();
    this.coins = new Map();
    this.rewards = new Map();
    this.creators = new Map();
    this.comments = new Map();
  }

  async getScrapedContent(id: string): Promise<ScrapedContent | undefined> {
    return this.scrapedContent.get(id);
  }

  async createScrapedContent(insertContent: InsertScrapedContent): Promise<ScrapedContent> {
    const id = randomUUID();
    const content: ScrapedContent = { 
      ...insertContent,
      platform: insertContent.platform ?? 'blog',
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
    const coin = Array.from(this.coins.values()).find(
      (coin) => coin.address?.toLowerCase() === address.toLowerCase()
    );
    
    if (!coin) return undefined;
    
    if (coin.scrapedContentId) {
      const content = this.scrapedContent.get(coin.scrapedContentId);
      if (content) {
        return {
          ...coin,
          metadata: {
            title: content.title,
            description: content.description,
            image: content.image,
            originalUrl: content.url,
            author: content.author
          }
        } as any;
      }
    }
    
    return coin;
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const id = randomUUID();
    const coin: Coin = { 
      ...insertCoin,
      address: insertCoin.address ?? null,
      status: insertCoin.status ?? 'pending',
      scrapedContentId: insertCoin.scrapedContentId ?? null,
      ipfsUri: insertCoin.ipfsUri ?? null,
      id,
      createdAt: new Date()
    };
    this.coins.set(id, coin);
    return coin;
  }

  async updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined> {
    const coin = this.coins.get(id);
    if (!coin) return undefined;
    
    const updatedCoin: Coin = {
      ...coin,
      ...(update.address !== undefined && { address: update.address }),
      ...(update.status !== undefined && { status: update.status }),
    };
    
    this.coins.set(id, updatedCoin);
    return updatedCoin;
  }

  async getAllCoins(): Promise<Coin[]> {
    const coins = Array.from(this.coins.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    return coins.map(coin => {
      if (coin.scrapedContentId) {
        const content = this.scrapedContent.get(coin.scrapedContentId);
        if (content) {
          return {
            ...coin,
            metadata: {
              title: content.title,
              description: content.description,
              image: content.image,
              originalUrl: content.url,
              author: content.author
            }
          };
        }
      }
      return coin;
    }) as any;
  }

  async getCoinsByCreator(creator: string): Promise<Coin[]> {
    const coins = Array.from(this.coins.values()).filter(
      (coin) => coin.creator.toLowerCase() === creator.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return coins.map(coin => {
      if (coin.scrapedContentId) {
        const content = this.scrapedContent.get(coin.scrapedContentId);
        if (content) {
          return {
            ...coin,
            metadata: {
              title: content.title,
              description: content.description,
              image: content.image,
              originalUrl: content.url,
              author: content.author
            }
          };
        }
      }
      return coin;
    }) as any;
  }

  async getReward(id: string): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      ...insertReward,
      rewardCurrency: insertReward.rewardCurrency ?? 'ZORA',
      id,
      createdAt: new Date()
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRewardsByCoin(coinAddress: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.coinAddress.toLowerCase() === coinAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRewardsByRecipient(recipientAddress: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.recipientAddress.toLowerCase() === recipientAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCreator(id: string): Promise<Creator | undefined> {
    return this.creators.get(id);
  }

  async getCreatorByAddress(address: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(
      (creator) => creator.address.toLowerCase() === address.toLowerCase()
    );
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = randomUUID();
    const creator: Creator = {
      ...insertCreator,
      verified: insertCreator.verified ?? 'false',
      totalCoins: insertCreator.totalCoins ?? '0',
      totalVolume: insertCreator.totalVolume ?? '0',
      followers: insertCreator.followers ?? '0',
      name: insertCreator.name ?? null,
      bio: insertCreator.bio ?? null,
      avatar: insertCreator.avatar ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreator(id: string, update: UpdateCreator): Promise<Creator | undefined> {
    const creator = this.creators.get(id);
    if (!creator) return undefined;
    
    const updatedCreator: Creator = {
      ...creator,
      ...(update.name !== undefined && { name: update.name }),
      ...(update.bio !== undefined && { bio: update.bio }),
      ...(update.avatar !== undefined && { avatar: update.avatar }),
      ...(update.verified !== undefined && { verified: update.verified }),
      ...(update.totalCoins !== undefined && { totalCoins: update.totalCoins }),
      ...(update.totalVolume !== undefined && { totalVolume: update.totalVolume }),
      ...(update.followers !== undefined && { followers: update.followers }),
      updatedAt: new Date()
    };
    
    this.creators.set(id, updatedCreator);
    return updatedCreator;
  }

  async getAllCreators(): Promise<Creator[]> {
    return Array.from(this.creators.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getTopCreators(): Promise<Creator[]> {
    return Array.from(this.creators.values()).sort(
      (a, b) => parseInt(b.totalCoins) - parseInt(a.totalCoins)
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      transactionHash: insertComment.transactionHash ?? null,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByCoin(coinAddress: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.coinAddress.toLowerCase() === coinAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllComments(): Promise<Comment[]> {
    return Array.from(this.comments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
