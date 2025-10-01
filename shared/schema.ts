import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scrapedContent = pgTable("scraped_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  platform: text("platform").notNull().default('blog'),
  title: text("title").notNull(),
  description: text("description"),
  author: text("author"),
  publishDate: text("publish_date"),
  image: text("image"),
  content: text("content"),
  tags: json("tags").$type<string[]>(),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

export const coins = pgTable("coins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  address: text("address"),
  creator: text("creator").notNull(),
  status: text("status").notNull().default('pending'),
  scrapedContentId: varchar("scraped_content_id").references(() => scrapedContent.id),
  ipfsUri: text("ipfs_uri"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScrapedContentSchema = createInsertSchema(scrapedContent).omit({
  id: true,
  scrapedAt: true,
});

export const coinStatusSchema = z.enum(['pending', 'active', 'failed']);
export type CoinStatus = z.infer<typeof coinStatusSchema>;

export const insertCoinSchema = createInsertSchema(coins).omit({
  id: true,
  createdAt: true,
}).extend({
  status: coinStatusSchema.optional(),
  address: z.string().optional(),
});

export const updateCoinSchema = z.object({
  address: z.string().optional(),
  status: coinStatusSchema.optional(),
});

export type InsertScrapedContent = z.infer<typeof insertScrapedContentSchema>;
export type ScrapedContent = typeof scrapedContent.$inferSelect;

export type InsertCoin = z.infer<typeof insertCoinSchema>;
export type UpdateCoin = z.infer<typeof updateCoinSchema>;
export type Coin = typeof coins.$inferSelect;
