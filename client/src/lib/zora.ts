
import { 
  createCoin, 
  createCoinCall, 
  setApiKey,
  getCoinCreateFromLogs,
  DeployCurrency
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
    const rpcUrl = import.meta.env.VITE_NEXT_PUBLIC_ZORA_RPC_URL || 
                   `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Create coin arguments matching SDK v0.2.1 API
    const createCoinArgs = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.image || "",
      chainId,
      payoutRecipient: creatorAddress, // Creator receives payouts
      currency: DeployCurrency.ETH,
    };

    // For client-side, we'll return the call data instead of executing
    // The actual transaction will be handled by the wallet client
    const txCalls = await createCoinCall(createCoinArgs);
    
    // Return mock result for now - in real implementation, this would be handled by wallet
    return {
      hash: `0x${Math.random().toString(16).substring(2)}` as Hash,
      address: `0x${Math.random().toString(16).substring(2, 42)}` as Address,
      deployment: txCalls
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
    // Set up clients
    const chain = chainId === baseSepolia.id ? baseSepolia : base;
    const rpcUrl = import.meta.env.VITE_NEXT_PUBLIC_ZORA_RPC_URL || 
                   `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Create coin arguments matching SDK v0.2.1 API
    const createCoinArgs = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: typeof metadata.image === 'string' ? metadata.image : "",
      chainId,
      payoutRecipient: creatorAddress,
      currency: DeployCurrency.ETH,
    };

    // Create coin using high-level function with SDK v0.2.1 signature
    const result = await createCoin(
      createCoinArgs,
      walletClient,
      publicClient
    );

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

// Export for compatibility
export const createBaseCoin = createZoraCoin;
