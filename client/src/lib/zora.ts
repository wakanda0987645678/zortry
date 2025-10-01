
import { 
  createCoin, 
  createCoinCall, 
  setApiKey, 
  createMetadataBuilder, 
  createZoraUploaderForCreator,
  getCoinCreateFromLogs
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
    // Create metadata using Zora's metadata builder
    let metadataParams;
    
    if (metadata.image instanceof File) {
      // Upload file using Zora's uploader
      const { createMetadataParameters } = await createMetadataBuilder()
        .withName(metadata.name)
        .withSymbol(metadata.symbol)
        .withDescription(metadata.description || "")
        .withImage(metadata.image)
        .upload(createZoraUploaderForCreator(creatorAddress));
      
      metadataParams = createMetadataParameters;
    } else {
      // Use provided URI
      metadataParams = {
        name: metadata.name,
        symbol: metadata.symbol,
        metadata: {
          type: "RAW_URI" as const,
          uri: metadata.image || ""
        }
      };
    }

    // Set up clients for the specified chain
    const chain = chainId === baseSepolia.id ? baseSepolia : base;
    const rpcUrl = import.meta.env.VITE_NEXT_PUBLIC_ZORA_RPC_URL || 
                   `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Create coin arguments
    const createCoinArgs = {
      creator: creatorAddress,
      ...metadataParams,
      currency: "ETH", // Use ETH for Base
      chainId,
      startingMarketCap: "LOW",
    };

    // For client-side, we'll return the call data instead of executing
    // The actual transaction will be handled by the wallet client
    const txCalls = await createCoinCall(createCoinArgs);
    
    // Return mock result for now - in real implementation, this would be handled by wallet
    return {
      hash: `0x${Math.random().toString(16).substring(2)}` as Hash,
      address: `0x${Math.random().toString(16).substring(2, 42)}` as Address,
      deployment: txCalls[0]
    };

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
    // Create metadata using Zora's metadata builder
    const { createMetadataParameters } = await createMetadataBuilder()
      .withName(metadata.name)
      .withSymbol(metadata.symbol)
      .withDescription(metadata.description || "")
      .withImage(metadata.image instanceof File ? metadata.image : new File([""], "placeholder.png", { type: "image/png" }))
      .upload(createZoraUploaderForCreator(creatorAddress));

    // Set up clients
    const chain = chainId === baseSepolia.id ? baseSepolia : base;
    const rpcUrl = import.meta.env.VITE_NEXT_PUBLIC_ZORA_RPC_URL || 
                   `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Create coin using high-level function
    const result = await createCoin({
      call: {
        creator: creatorAddress,
        ...createMetadataParameters,
        currency: "ETH",
        chainId,
        startingMarketCap: "LOW",
      },
      walletClient,
      publicClient,
    });

    return result;

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

// Export for compatibility
export const createBaseCoin = createZoraCoin;
