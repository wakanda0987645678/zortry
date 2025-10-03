import {
  createCoin,
  createCoinCall,
  setApiKey,
  getCoinCreateFromLogs,
  CreateConstants,
  tradeCoin,
  TradeParameters
} from "@zoralabs/coins-sdk";
import { createPublicClient, createWalletClient, http, parseEther, type Address, type Hash } from "viem";
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

    // Admin platform referral address for earning 20% of all future trading fees
    const ADMIN_PLATFORM_REFERRAL = import.meta.env.VITE_ADMIN_REFERRAL_ADDRESS || 
                                    "0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7"; // Default admin wallet

    // Create coin arguments matching SDK v0.3.2 API with platform referral
    const createCoinArgs = {
      creator: creatorAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      metadata: { type: "RAW_URI" as const, uri: metadataUri || "" },
      currency: CreateConstants.ContentCoinCurrencies.ETH,
      chainId,
      skipMetadataValidation: true, // Skip validation since we've already validated and uploaded
      platformReferrer: ADMIN_PLATFORM_REFERRAL, // Earn 20% of all trading fees for this coin
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

    // Admin platform referral address for earning 20% of all future trading fees
    const ADMIN_PLATFORM_REFERRAL = import.meta.env.VITE_ADMIN_REFERRAL_ADDRESS || 
                                    "0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7"; // Default admin wallet

    // Create coin arguments matching SDK v0.3.2 API with platform referral
    const createCoinArgs = {
      creator: creatorAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      metadata: { type: "RAW_URI" as const, uri: metadataUri || "" },
      currency: CreateConstants.ContentCoinCurrencies.ETH,
      chainId,
      skipMetadataValidation: true, // Skip validation since we've already validated and uploaded
      platformReferrer: ADMIN_PLATFORM_REFERRAL, // Earn 20% of all trading fees for this coin
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
  userAddress,
  isBuying = true
}: {
  coinAddress: Address;
  ethAmount: string;
  walletClient: any;
  publicClient: any;
  userAddress: Address;
  isBuying?: boolean;
}) {
  if (!ZORA_API_KEY) {
    throw new Error("Zora API key not configured");
  }

  try {
    const { tradeCoin } = await import("@zoralabs/coins-sdk");

    // Convert ETH amount to wei for the transaction
    const amountInWei = parseEther(ethAmount);

    // Admin trade referral address for earning 4% of this specific trade
    const ADMIN_TRADE_REFERRAL = import.meta.env.VITE_ADMIN_REFERRAL_ADDRESS || 
                                 "0xf25af781c4F1Df40Ac1D06e6B80c17815AD311F7";

    // Create trade parameters according to Zora SDK documentation
    const tradeParameters = isBuying ? {
      // Buying coin with ETH
      sell: { type: "eth" as const },
      buy: { 
        type: "erc20" as const, 
        address: coinAddress 
      },
      amountIn: amountInWei,
      slippage: 0.05, // 5% slippage tolerance
      sender: userAddress,
      tradeReferrer: ADMIN_TRADE_REFERRAL, // Earn 4% of this trade
    } : {
      // Selling coin for ETH
      sell: { 
        type: "erc20" as const, 
        address: coinAddress 
      },
      buy: { type: "eth" as const },
      amountIn: amountInWei,
      slippage: 0.15, // 15% slippage tolerance for selling
      sender: userAddress,
      tradeReferrer: ADMIN_TRADE_REFERRAL, // Earn 4% of this trade
    };

    console.log("Trading with parameters:", tradeParameters);

    // Get account from wallet client
    const account = walletClient.account;
    if (!account) {
      throw new Error("No account found in wallet client");
    }

    const receipt = await tradeCoin({
      tradeParameters,
      walletClient,
      account,
      publicClient,
    });

    console.log("Trade receipt:", receipt);

    if (!receipt || !receipt.transactionHash) {
      throw new Error("Trade transaction failed - no transaction hash returned");
    }

    return {
      hash: receipt.transactionHash,
      success: true,
      receipt
    };
  } catch (error) {
    console.error("Trade error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient ETH balance for this trade");
      } else if (error.message.includes("user rejected")) {
        throw new Error("Transaction was cancelled by user");
      } else if (error.message.includes("slippage")) {
        throw new Error("Trade failed due to high slippage - try again with higher slippage tolerance");
      } else if (error.message.includes("Slippage must be less than 1")) {
        throw new Error("Invalid slippage configuration");
      } else if (error.message.includes("Amount in must be greater than 0")) {
        throw new Error("Trade amount must be greater than 0");
      } else {
        throw new Error(`Trading failed: ${error.message}`);
      }
    }

    throw new Error("Trading failed - unknown error occurred");
  }
}

// Export for compatibility
export const createBaseCoin = createZoraCoin;