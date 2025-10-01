import {
  createCoin,
  createCoinCall,
  setApiKey,
  getCoinCreateFromLogs,
  CreateConstants
} from "@zoralabs/coins-sdk";
import { createPublicClient, createWalletClient, http, type Address, type Hash } from "viem";
import { base, baseSepolia } from "viem/chains";

// Set up Zora API key
const ZORA_API_KEY = import.meta.env.VITE_NEXT_PUBLIC_ZORA_API_KEY || "";

if (ZORA_API_KEY) {
  setApiKey(ZORA_API_KEY);
} else {
  console.warn("VITE_NEXT_PUBLIC_ZORA_API_KEY not configured");
}

export interface CoinMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string | File;
  externalUrl?: string;
}

export interface CoinCreationResult {
  hash: Hash;
  address: Address;
  deployment: any;
}

export async function createZoraCoin(
  metadata: CoinMetadata,
  creatorAddress: Address,
  chainId: number = base.id
): Promise<CoinCreationResult> {
  if (!ZORA_API_KEY) {
    throw new Error("Zora API key not configured");
  }

  try {
    // Set up clients for the specified chain
    const chain = chainId === baseSepolia.id ? baseSepolia : base;
    const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY || "o3VW3WRXrsXXMRX3l7jZxLUqhWyZzXBy";
    const rpcUrl = import.meta.env.VITE_ZORA_RPC_URL || 
                   `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Create proper JSON metadata for Zora SDK
    const jsonMetadata = {
      name: metadata.name,
      description: metadata.description || `A coin representing ${metadata.name}`,
      image: metadata.image || "",
      external_url: metadata.externalUrl || "",
      attributes: [
        {
          trait_type: "Platform",
          value: "web"
        },
        {
          trait_type: "Creator",
          value: creatorAddress
        }
      ]
    };

    // Upload JSON metadata to Pinata
    let metadataUri = "";
    try {
      const { uploadToPinata } = await import('./pinata');
      const metadataBlob = new Blob([JSON.stringify(jsonMetadata, null, 2)], { 
        type: 'application/json' 
      });
      const metadataFile = new File([metadataBlob], `${metadata.symbol || 'coin'}-metadata.json`, { 
        type: 'application/json' 
      });

      const ipfsHash = await uploadToPinata(metadataFile);

      if (ipfsHash) {
        // Use Cloudflare's public IPFS gateway for validation (Zora SDK needs to fetch it)
        metadataUri = `https://dweb.link/ipfs/${ipfsHash}`;
        console.log(`Created metadata URI: ${metadataUri}`);
      }
    } catch (uploadError) {
      console.error('Failed to upload metadata to Pinata:', uploadError);
      // Fall back to empty URI which Zora SDK accepts
      metadataUri = "";
    }

    // Create coin arguments matching SDK v0.3.2 API
    const createCoinArgs = {
      creator: creatorAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      metadata: { type: "RAW_URI" as const, uri: metadataUri || "" },
      currency: CreateConstants.ContentCoinCurrencies.ETH,
      chainId,
      skipMetadataValidation: true, // Skip validation since we've already validated and uploaded
    };

    // For client-side, we'll return the call data instead of executing
    // The actual transaction will be handled by the wallet client
    const txCalls = await createCoinCall(createCoinArgs);

    // This is a placeholder - actual implementation requires wallet integration
    throw new Error("Wallet integration required for actual coin creation. This is a development environment limitation.");

  } catch (error) {
    console.error("Zora coin creation error:", error);
    throw new Error(`Failed to create Zora coin: ${error}`);
  }
}

export async function createZoraCoinWithWallet(
  metadata: CoinMetadata,
  creatorAddress: Address,
  walletClient: any,
  chainId: number = base.id
): Promise<CoinCreationResult> {
  if (!ZORA_API_KEY) {
    throw new Error("Zora API key not configured");
  }

  try {
    // Set up clients
    const chain = chainId === baseSepolia.id ? baseSepolia : base;
    const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY || "o3VW3WRXrsXXMRX3l7jZxLUqhWyZzXBy";
    const rpcUrl = import.meta.env.VITE_ZORA_RPC_URL || 
                   `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Create proper JSON metadata for Zora SDK
    const jsonMetadata = {
      name: metadata.name,
      description: metadata.description || `A coin representing ${metadata.name}`,
      image: metadata.image || "",
      external_url: metadata.externalUrl || "",
      attributes: [
        {
          trait_type: "Platform",
          value: "web"
        },
        {
          trait_type: "Creator",
          value: creatorAddress
        }
      ]
    };

    // Upload JSON metadata to Pinata
    let metadataUri = "";
    try {
      const { uploadToPinata } = await import('./pinata');
      const metadataBlob = new Blob([JSON.stringify(jsonMetadata, null, 2)], { 
        type: 'application/json' 
      });
      const metadataFile = new File([metadataBlob], `${metadata.symbol || 'coin'}-metadata.json`, { 
        type: 'application/json' 
      });

      const ipfsHash = await uploadToPinata(metadataFile);

      if (ipfsHash) {
        // Use Cloudflare's public IPFS gateway for validation (Zora SDK needs to fetch it)
        metadataUri = `https://dweb.link/ipfs/${ipfsHash}`;
        console.log(`Created metadata URI: ${metadataUri}`);
      }
    } catch (uploadError) {
      console.error('Failed to upload metadata to Pinata:', uploadError);
      // Fall back to empty URI which Zora SDK accepts
      metadataUri = "";
    }

    // Create coin arguments matching SDK v0.3.2 API
    const createCoinArgs = {
      creator: creatorAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      metadata: { type: "RAW_URI" as const, uri: metadataUri || "" },
      currency: CreateConstants.ContentCoinCurrencies.ETH,
      chainId,
      skipMetadataValidation: true, // Skip validation since we've already validated and uploaded
    };

    // Create coin using high-level function with SDK v0.3.2 signature
    const result = await createCoin({
      call: createCoinArgs,
      walletClient,
      publicClient,
    });

    // Ensure address is defined
    if (!result.address) {
      throw new Error("Coin address not returned from creation");
    }

    return {
      hash: result.hash,
      address: result.address,
      deployment: result.deployment
    };

  } catch (error) {
    console.error("Zora coin creation with wallet error:", error);
    throw new Error(`Failed to create Zora coin: ${error}`);
  }
}

export async function getCoinStats(coinAddress: string) {
  // This would integrate with Zora's coin querying APIs
  // For now, return null as placeholder
  return null;
}

export async function tradeZoraCoin({
  coinAddress,
  ethAmount,
  walletClient,
  publicClient,
  userAddress
}: {
  coinAddress: Address;
  ethAmount: string;
  walletClient: any;
  publicClient: any;
  userAddress: Address;
}) {
  try {
    const { tradeCoin } = await import("@zoralabs/coins-sdk");
    
    const tradeParams = {
      tokenIn: "ETH", // Trading ETH for the coin
      tokenOut: coinAddress,
      amountIn: ethAmount,
      recipient: userAddress,
      slippagePercentage: 5, // 5% slippage tolerance
    };

    const result = await tradeCoin({
      parameters: tradeParams,
      walletClient,
      publicClient,
    });

    return result;
  } catch (error) {
    console.error("Trade error:", error);
    throw new Error(`Trading failed: ${error}`);
  }
}

// Export for compatibility
export const createBaseCoin = createZoraCoin;