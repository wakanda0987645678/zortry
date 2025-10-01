import { storage } from "./storage";

// Old coins data structure
interface OldCoin {
  id: string;
  coin_address: string;
  creator_wallet: string;
  transaction_hash: string;
  created_at: string;
  ipfs_uri: string;
  metadata: {
    tags?: string[];
    image?: string;
    title?: string;
    author?: string;
    content?: string;
    description?: string;
    originalUrl?: string;
    publishDate?: string;
  };
  name: string;
  symbol: string;
}

const oldCoinsData: OldCoin[] = [
  {
    id: '085bbf2d-ea9a-4311-a93c-81efe81c4e03',
    coin_address: '0xd4eC4b5D04EB1cc6344f25611542E540Da3AcBF7',
    creator_wallet: '0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7',
    transaction_hash: '0xf32a87327eb785d7c62bccc72e04099c36f6d9ac6795671edd44694f155b3be1',
    created_at: '2025-09-25 00:03:55.594818',
    ipfs_uri: 'ipfs://bafkreihrnjn4hj6wozky2ss357ma7ewasghxjovzpyykagy5c5qqkt5x3i',
    metadata: {
      tags: [],
      image: 'https://zora.co/api/og-image/coin/base:0xde7c9a53edd5ef151210aa7c1da9dc80068547ab',
      title: 'Test this test that',
      author: '',
      content: '',
      description: 'A coin representing the blog post: Why Every Senior Developer I Know Is Planning Their Exit | by Harishsingh | Sep, 2025 | Medium',
      originalUrl: 'https://zora.co/coin/base:0xde7c9a53edd5ef151210aa7c1da9dc80068547ab',
      publishDate: ''
    },
    name: 'Test this test that',
    symbol: 'TESTTHIS'
  },
  {
    id: '5802d950-d913-4fc2-b4ef-5d4c2f1db213',
    coin_address: '0x509059DBB581927C8641673126eBACD46AC359Ca',
    creator_wallet: '0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7',
    transaction_hash: '0xa0a1215e52ede64b456c92987c4ce6547ba53e309ae80ec064b1e06865f9f6ca',
    created_at: '2025-09-25 16:07:43.724032',
    ipfs_uri: 'ipfs://bafkreiel7sh6daodoktdm3pmaeblaknyp2otbilkz3xthvozvksu6gxnge',
    metadata: {
      tags: [],
      image: 'https://yellow-patient-cheetah-559.mypinata.cloud/ipfs/bafkreiel7sh6daodoktdm3pmaeblaknyp2otbilkz3xthvozvksu6gxnge',
      title: 'VICTORIA',
      author: '',
      content: '',
      description: '',
      originalUrl: '',
      publishDate: ''
    },
    name: 'VICTORIA',
    symbol: 'VICTO'
  },
  {
    id: 'f4248ea3-59b2-4448-92ae-bfc7f59e9d12',
    coin_address: '0xDE7C9a53eDd5Ef151210Aa7C1Da9dC80068547Ab',
    creator_wallet: '0xb843A2D0D4B9E628500d2E0f6f0382e063C14a95',
    transaction_hash: '0xf2469e00c6688fa9b193bc7b4c1f0ebacf64f87ae552dec948c53d83a0c4b370',
    created_at: '2025-09-13 13:27:57.883838',
    ipfs_uri: 'ipfs://bafkreihtfa57szgjp6qu7xzytj7otuyoyl67qmnzlu3p4bmesuumpsa3ki',
    metadata: {
      tags: [],
      image: 'https://miro.medium.com/v2/da:true/resize:fit:1200/0*jCeSNt_UZku7uzGM',
      title: 'Why Every Senior Developer I Know Is Planning Their Exit | by Harishsingh | Sep, 2025 | Medium',
      author: 'Harishsingh',
      content: 'Member-only storyWhy Every Senior Developer I Know Is Planning Their ExitHarishsingh4 min read·Sep 4, 2025--62ShareAfter 10 years in software development...',
      description: 'Why Every Senior Developer I Know Is Planning Their Exit After 10 years in software development, with the last three in high-frequency trading...',
      originalUrl: 'https://medium.com/@harishsingh8529/why-every-senior-developer-i-know-is-planning-their-exit-8294cc17b7c7',
      publishDate: '2025-09-10T04:50:40.894Z'
    },
    name: 'Test this test that',
    symbol: 'TESTEST'
  }
];

export async function migrateOldData() {
  const startTime = Date.now();
  const errors: string[] = [];
  let migratedCount = 0;
  
  for (const oldCoin of oldCoinsData) {
    try {
      // Create scraped content from metadata
      const scrapedContent = await storage.createScrapedContent({
        url: oldCoin.metadata.originalUrl || `https://etherscan.io/tx/${oldCoin.transaction_hash}`,
        platform: 'blog',
        title: oldCoin.metadata.title || oldCoin.name,
        description: oldCoin.metadata.description || '',
        author: oldCoin.metadata.author || '',
        publishDate: oldCoin.metadata.publishDate || '',
        image: oldCoin.metadata.image || '',
        content: oldCoin.metadata.content || '',
        tags: oldCoin.metadata.tags || [],
      });
      
      // Create coin linked to scraped content
      await storage.createCoin({
        name: oldCoin.name,
        symbol: oldCoin.symbol,
        address: oldCoin.coin_address,
        creator: oldCoin.creator_wallet,
        scrapedContentId: scrapedContent.id,
        ipfsUri: oldCoin.ipfs_uri,
      });
      
      migratedCount++;
    } catch (error) {
      const errorMsg = `Failed to migrate coin ${oldCoin.id}: ${error}`;
      errors.push(errorMsg);
    }
  }
  
  const duration = Date.now() - startTime;
  return { 
    success: true, 
    count: migratedCount, 
    total: oldCoinsData.length,
    errors,
    duration: `${duration}ms`
  };
}

// Export for use in routes
export { oldCoinsData };
