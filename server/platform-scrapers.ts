import axios from "axios";
import * as cheerio from "cheerio";
import { type PlatformType } from "./platform-detector";

export interface ScrapedData {
  url: string;
  platform: PlatformType;
  title: string;
  description?: string;
  author?: string;
  publishDate?: string;
  image?: string;
  content?: string;
  tags?: string[];
  followers?: number;
  engagement?: number;
}

// Instagram - using oEmbed API (public, no auth required)
async function scrapeInstagramOembed(url: string): Promise<ScrapedData> {
  try {
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=YOUR_INSTAGRAM_TOKEN`;
    const response = await axios.get(oembedUrl, { timeout: 10000 });

    return {
      url,
      platform: 'instagram',
      title: response.data.title || 'Instagram Post',
      author: response.data.author_name || '',
      image: response.data.thumbnail_url || '',
      description: `Instagram content by ${response.data.author_name}`,
      content: response.data.title || '',
    };
  } catch (error) {
    // Fallback to username extraction
    const username = url.match(/instagram\.com\/([^\/\?]+)/)?.[1] || 'user';
    return {
      url,
      platform: 'instagram',
      title: `Instagram - @${username}`,
      author: username,
      description: `Instagram profile for @${username}`,
      content: `Profile for @${username}`,
    };
  }
}

// TikTok - using oEmbed API (public)
async function scrapeTikTokOembed(url: string): Promise<ScrapedData> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await axios.get(oembedUrl, { timeout: 10000 });

    return {
      url,
      platform: 'tiktok',
      title: response.data.title || 'TikTok Video',
      author: response.data.author_name || '',
      image: response.data.thumbnail_url || '',
      description: `TikTok video by ${response.data.author_name}`,
      content: response.data.title || '',
    };
  } catch (error) {
    const username = url.match(/tiktok\.com\/@([^\/\?]+)/)?.[1] || 'user';
    return {
      url,
      platform: 'tiktok',
      title: `TikTok - @${username}`,
      author: username,
      description: `TikTok profile for @${username}`,
      content: `Profile for @${username}`,
    };
  }
}

// YouTube - using oEmbed API (public)
async function scrapeYouTube(url: string): Promise<ScrapedData> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl, { timeout: 10000 });

    return {
      url,
      platform: 'youtube',
      title: response.data.title || 'YouTube Video',
      author: response.data.author_name || '',
      image: response.data.thumbnail_url || '',
      description: `YouTube video by ${response.data.author_name}`,
      content: response.data.title || '',
    };
  } catch (error) {
    // Fallback to HTML scraping
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 30000,
    });
    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr('content') || 'YouTube Content';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const author = $('link[itemprop="name"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    return { url, platform: 'youtube', title, description, author, image, content: description };
  }
}

// Twitter/X - using Nitter instances (scraping-friendly mirror)
async function scrapeTwitterNitter(url: string): Promise<ScrapedData> {
  try {
    // Convert twitter.com URL to nitter.net (privacy-friendly mirror)
    const nitterUrl = url.replace(/twitter\.com|x\.com/, 'nitter.net');
    const response = await axios.get(nitterUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    const title = $('.fullname').first().text().trim() || 'Twitter Profile';
    const username = $('.username').first().text().trim() || '';
    const description = $('.profile-bio').text().trim() || '';
    const image = $('.profile-card-avatar').attr('src') || '';
    const followers = $('.profile-stat-num').first().text().trim();

    return {
      url,
      platform: 'twitter',
      title,
      author: username,
      description,
      image: image ? `https://nitter.net${image}` : '',
      content: description,
      followers: followers ? parseInt(followers.replace(/,/g, '')) : undefined,
    };
  } catch (error) {
    const username = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/)?.[1] || 'user';
    return {
      url,
      platform: 'twitter',
      title: `Twitter/X - @${username}`,
      author: username,
      description: `Twitter profile for @${username}`,
      content: `Profile for @${username}`,
    };
  }
}

async function scrapeSpotify(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || 'Spotify Content';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[name="music:musician"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  return { url, platform: 'spotify', title, description, author, image, content: description };
}

async function scrapeMedium(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Medium Article';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[property="author"]').attr('content') || '';
  const publishDate = $('meta[property="article:published_time"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style, nav, footer, header').remove();
  const content = $('article').text().trim() || $('main').text().trim();
  const tags = $('meta[property="article:tag"]').map((_, el) => $(el).attr('content')).get();

  return { url, platform: 'medium', title, description, author, publishDate, image, content: content.substring(0, 10000), tags };
}

async function scrapeSubstack(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Substack Post';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[name="author"]').attr('content') || '';
  const publishDate = $('time').attr('datetime') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style, nav, footer, header').remove();
  const content = $('.body').text().trim() || $('article').text().trim();

  return { url, platform: 'substack', title, description, author, publishDate, image, content: content.substring(0, 10000) };
}

async function scrapeGitcoin(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Gitcoin Grant';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.grant-description').text().trim() || $('main').text().trim();

  return { url, platform: 'gitcoin', title, description, image, content: content.substring(0, 10000) };
}

async function scrapeGiveth(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Giveth Project';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.project-description').text().trim() || $('main').text().trim();

  return { url, platform: 'giveth', title, description, image, content: content.substring(0, 10000) };
}

async function scrapeGitHub(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'GitHub Project';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[property="profile:username"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.markdown-body').text().trim() || $('#readme').text().trim() || $('.repository-content').text().trim();

  return { url, platform: 'github', title, description, author, image, content: content.substring(0, 10000) };
}

async function scrapeFarcaster(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Farcaster Channel';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[property="profile:username"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('main').text().trim() || $('.profile').text().trim() || $('body').text().trim();

  return { url, platform: 'farcaster', title, description, author, image, content: content.substring(0, 10000) };
}

async function scrapeTwitch(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Twitch Channel';
  const description = $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[property="og:site_name"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.channel-info-content').text().trim() || $('main').text().trim() || $('body').text().trim();

  return { url, platform: 'twitch', title, description, author, image, content: content.substring(0, 10000) };
}

async function scrapeGenericBlog(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || 'Web Content';
  const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[name="author"]').attr('content') || '';
  const publishDate = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || '';
  const image = $('meta[property="og:image"]').attr('content') || $('img').first().attr('src') || '';

  let content = '';
  const contentSelectors = ['article', '[role="main"]', '.post-content', '.entry-content', '.content', 'main'];

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      element.find('script, style, nav, footer, header').remove();
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content || content.length < 100) {
    $('script, style, nav, footer, header').remove();
    content = $('body').text().trim();
  }

  content = content.replace(/\s+/g, ' ').trim();
  const tags = $('meta[name="keywords"]').attr('content')?.split(',').map(tag => tag.trim()) || [];

  return { url, platform: 'blog', title, description, author, publishDate, image, content: content.substring(0, 10000), tags };
}

export async function scrapeByPlatform(url: string, platform: PlatformType): Promise<ScrapedData> {
  try {
    switch (platform) {
      case 'youtube':
        return await scrapeYouTube(url);
      case 'spotify':
        return await scrapeSpotify(url);
      case 'medium':
        return await scrapeMedium(url);
      case 'substack':
        return await scrapeSubstack(url);
      case 'gitcoin':
        return await scrapeGitcoin(url);
      case 'giveth':
        return await scrapeGiveth(url);
      case 'tiktok':
        return await scrapeTikTokOembed(url);
      case 'instagram':
        return await scrapeInstagramOembed(url);
      case 'twitter':
        return await scrapeTwitterNitter(url);
      case 'github':
        return await scrapeGitHub(url);
      case 'farcaster':
        return await scrapeFarcaster(url);
      case 'twitch':
        return await scrapeTwitch(url);
      case 'blog':
      default:
        return await scrapeGenericBlog(url);
    }
  } catch (error) {
    throw error;
  }
}