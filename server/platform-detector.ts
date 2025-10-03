export type PlatformType = 
  | 'youtube'
  | 'spotify'
  | 'medium'
  | 'substack'
  | 'gitcoin'
  | 'giveth'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'github'
  | 'farcaster'
  | 'twitch'
  | 'blog';

export interface PlatformInfo {
  type: PlatformType;
  name: string;
  id?: string;
}

export function detectPlatform(url: string): PlatformInfo {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // YouTube
    if (hostname.includes('youtube.com') || hostname === 'youtu.be') {
      const match = pathname.match(/\/(channel|c|user|@)\/([^\/]+)/);
      return {
        type: 'youtube',
        name: 'YouTube',
        id: match ? match[2] : undefined
      };
    }

    // Spotify
    if (hostname.includes('spotify.com')) {
      const match = pathname.match(/\/(track|album|artist|playlist)\/([^\/\?]+)/);
      return {
        type: 'spotify',
        name: 'Spotify',
        id: match ? match[2] : undefined
      };
    }

    // Medium
    if (hostname.includes('medium.com') || hostname.endsWith('.medium.com')) {
      return { type: 'medium', name: 'Medium' };
    }

    // Substack
    if (hostname.includes('substack.com')) {
      return { type: 'substack', name: 'Substack' };
    }

    // Gitcoin
    if (hostname.includes('gitcoin.co') || hostname.includes('grants.gitcoin.co')) {
      return { type: 'gitcoin', name: 'Gitcoin' };
    }

    // Giveth
    if (hostname.includes('giveth.io')) {
      return { type: 'giveth', name: 'Giveth' };
    }

    // TikTok
    if (hostname.includes('tiktok.com')) {
      return { type: 'tiktok', name: 'TikTok' };
    }

    // Instagram
    if (hostname.includes('instagram.com')) {
      return { type: 'instagram', name: 'Instagram' };
    }

    // Twitter/X
    if (hostname.includes('twitter.com') || hostname === 'x.com') {
      return { type: 'twitter', name: 'Twitter/X' };
    }

    // GitHub
    if (hostname.includes('github.com')) {
      return { type: 'github', name: 'GitHub' };
    }

    // Farcaster
    if (hostname.includes('warpcast.com') || hostname.includes('farcaster.xyz')) {
      return { type: 'farcaster', name: 'Farcaster' };
    }

    // Twitch
    if (hostname.includes('twitch.tv')) {
      return { type: 'twitch', name: 'Twitch' };
    }

    // Default to generic blog
    return { type: 'blog', name: 'Blog/Article' };

  } catch (error) {
    return { type: 'blog', name: 'Blog/Article' };
  }
}

export const SUPPORTED_PLATFORMS = [
  { type: 'youtube', name: 'YouTube', example: 'https://youtube.com/@channelname' },
  { type: 'spotify', name: 'Spotify', example: 'https://open.spotify.com/track/...' },
  { type: 'medium', name: 'Medium', example: 'https://medium.com/@author/article' },
  { type: 'substack', name: 'Substack', example: 'https://example.substack.com/p/article' },
  { type: 'gitcoin', name: 'Gitcoin Grants', example: 'https://grants.gitcoin.co/...' },
  { type: 'giveth', name: 'Giveth', example: 'https://giveth.io/project/...' },
  { type: 'tiktok', name: 'TikTok', example: 'https://tiktok.com/@username' },
  { type: 'instagram', name: 'Instagram', example: 'https://instagram.com/username' },
  { type: 'twitter', name: 'Twitter/X', example: 'https://twitter.com/username' },
  { type: 'github', name: 'GitHub', example: 'https://github.com/username/project' },
  { type: 'farcaster', name: 'Farcaster', example: 'https://warpcast.com/username' },
  { type: 'twitch', name: 'Twitch', example: 'https://twitch.tv/username' },
  { type: 'blog', name: 'Personal Blogs & News', example: 'https://example.com/article' },
] as const;
