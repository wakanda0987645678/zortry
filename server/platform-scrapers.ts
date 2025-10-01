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
}

async function scrapeYouTube(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="title"]').attr('content') || 
                'YouTube Content';
  
  const description = $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
  
  const author = $('link[itemprop="name"]').attr('content') || 
                $('meta[name="author"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || 
                $('link[rel="image_src"]').attr('href') || '';

  return {
    url,
    platform: 'youtube',
    title,
    description,
    author,
    image,
    content: description,
  };
}

async function scrapeSpotify(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                'Spotify Content';
  
  const description = $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="twitter:description"]').attr('content') || '';
  
  const author = $('meta[name="music:musician"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || 
                $('meta[name="twitter:image"]').attr('content') || '';

  return {
    url,
    platform: 'spotify',
    title,
    description,
    author,
    image,
    content: description,
  };
}

async function scrapeMedium(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim() || 
                'Medium Article';
  
  const description = $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
  
  const author = $('meta[property="author"]').attr('content') || 
                $('meta[name="author"]').attr('content') || 
                $('a[rel="author"]').text().trim() || '';
  
  const publishDate = $('meta[property="article:published_time"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style, nav, footer, header').remove();
  const content = $('article').text().trim() || $('main').text().trim();

  const tags = $('meta[property="article:tag"]').map((_, el) => $(el).attr('content')).get();

  return {
    url,
    platform: 'medium',
    title,
    description,
    author,
    publishDate,
    image,
    content: content.substring(0, 10000),
    tags,
  };
}

async function scrapeSubstack(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim() || 
                'Substack Post';
  
  const description = $('meta[property="og:description"]').attr('content') || '';
  
  const author = $('meta[name="author"]').attr('content') || 
                $('a.frontend-pencraft-Text-module__decoration-hover-underline--BEYAn').first().text().trim() || '';
  
  const publishDate = $('time').attr('datetime') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style, nav, footer, header').remove();
  const content = $('.body').text().trim() || $('article').text().trim();

  return {
    url,
    platform: 'substack',
    title,
    description,
    author,
    publishDate,
    image,
    content: content.substring(0, 10000),
  };
}

async function scrapeGitcoin(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim() || 
                'Gitcoin Grant';
  
  const description = $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.grant-description').text().trim() || 
                 $('main').text().trim();

  return {
    url,
    platform: 'gitcoin',
    title,
    description,
    image,
    content: content.substring(0, 10000),
  };
}

async function scrapeGiveth(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim() || 
                'Giveth Project';
  
  const description = $('meta[property="og:description"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.project-description').text().trim() || 
                 $('main').text().trim();

  return {
    url,
    platform: 'giveth',
    title,
    description,
    image,
    content: content.substring(0, 10000),
  };
}

async function scrapeSocialMedia(url: string, platform: 'tiktok' | 'instagram' | 'twitter'): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                `${platform.charAt(0).toUpperCase() + platform.slice(1)} Content`;
  
  const description = $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="twitter:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
  
  const author = $('meta[name="author"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || 
                $('meta[name="twitter:image"]').attr('content') || '';

  return {
    url,
    platform,
    title,
    description,
    author,
    image,
    content: description,
  };
}

async function scrapeGitHub(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim() || 
                'GitHub Project';
  
  const description = $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
  
  const author = $('meta[property="profile:username"]').attr('content') || '';
  
  const image = $('meta[property="og:image"]').attr('content') || '';

  $('script, style').remove();
  const content = $('.markdown-body').text().trim() || 
                 $('#readme').text().trim() ||
                 $('.repository-content').text().trim();

  return {
    url,
    platform: 'github',
    title,
    description,
    author,
    image,
    content: content.substring(0, 10000),
  };
}

async function scrapeGenericBlog(url: string): Promise<ScrapedData> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  
  const title = $('title').text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim() || 
                'Web Content';

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

  return {
    url,
    platform: 'blog',
    title,
    description,
    author,
    publishDate,
    image,
    content: content.substring(0, 10000),
    tags,
  };
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
        return await scrapeSocialMedia(url, 'tiktok');
      case 'instagram':
        return await scrapeSocialMedia(url, 'instagram');
      case 'twitter':
        return await scrapeSocialMedia(url, 'twitter');
      case 'github':
        return await scrapeGitHub(url);
      case 'blog':
      default:
        return await scrapeGenericBlog(url);
    }
  } catch (error) {
    throw error;
  }
}
