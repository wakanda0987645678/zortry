'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Calendar, User, Coins, Copy, Check, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import "@/lib/zora";

const GATEWAY_URL = import.meta.env.VITE_NEXT_PUBLIC_GATEWAY_URL || 'yellow-patient-cheetah-559.mypinata.cloud';

interface CoinStatsIconsProps {
  price?: string | null;
  marketCap?: string | null;
  volume24h?: string | null;
  uniqueHolders?: number | null;
  earnings?: string | null;
}

function CoinStatsIcons({ price, marketCap, volume24h, uniqueHolders, earnings }: CoinStatsIconsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {price && (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-gray-600">Price:</span>
          <span className="font-semibold">${price}</span>
        </div>
      )}
      {marketCap && (
        <div className="flex items-center gap-1">
          <Coins className="h-3 w-3 text-blue-600" />
          <span className="text-gray-600">MCap:</span>
          <span className="font-semibold">${marketCap}</span>
        </div>
      )}
      {volume24h && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-purple-600" />
          <span className="text-gray-600">Vol:</span>
          <span className="font-semibold">${volume24h}</span>
        </div>
      )}
      {uniqueHolders && (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-orange-600" />
          <span className="text-gray-600">Holders:</span>
          <span className="font-semibold">{uniqueHolders}</span>
        </div>
      )}
    </div>
  );
}

interface CoinCardProps {
  coin: {
    id: string;
    name: string;
    symbol: string;
    address: string;
    creator: string;
    createdAt: string;
    metadata?: {
      title?: string;
      description?: string;
      image?: string;
      originalUrl?: string;
      author?: string;
    };
    ipfsUri?: string;
  };
  isOwnCoin?: boolean;
}

export default function CoinCard({ coin, isOwnCoin = false }: CoinCardProps) {
  const [copied, setCopied] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Responsive card size - smaller for mobile
  const CARD_WIDTH = 'auto';
  const CARD_HEIGHT = 'auto';
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ethAmount, setEthAmount] = useState("0.0001");
  const [price, setPrice] = useState<string | null>(null);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [volume24h, setVolume24h] = useState<string | null>(null);
  const [uniqueHolders, setUniqueHolders] = useState<number | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState<Array<{ amount: { currencyAddress: string; amountRaw: string; amountDecimal: number }; amountUsd?: string }> | null>(null);
  const [coinImage, setCoinImage] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    let isMounted = true;
    async function fetchCoinStats() {
      try {
        const response = await getCoin({
          address: coin.address,
          chain: base.id,
        });

        const coinData = response.data?.zora20Token;

        if (isMounted && coinData) {
          // Set market cap
          if (coinData.marketCap) {
            setMarketCap(parseFloat(coinData.marketCap).toFixed(2));
          }

          // Set 24h volume
          if (coinData.volume24h) {
            setVolume24h(parseFloat(coinData.volume24h).toFixed(2));
          }

          // Set unique holders
          if (coinData.uniqueHolders) {
            setUniqueHolders(coinData.uniqueHolders);
          }

          // Set creator earnings if available
          if (coinData.creatorEarnings) {
            setCreatorEarnings(coinData.creatorEarnings);
          }

          // Set coin image from mediaContent (use medium size for better quality)
          if (coinData.mediaContent?.previewImage) {
            const previewImage = coinData.mediaContent.previewImage as any;
            setCoinImage(previewImage.medium || previewImage.small || null);
          }
        }
      } catch (e) {
        console.error("Error fetching coin stats:", e);
        if (e && typeof e === 'object') {
          console.error("Error details:", JSON.stringify(e, null, 2));
        }
      }
    }
    if (typeof window !== "undefined") fetchCoinStats();
    return () => { isMounted = false; };
  }, [coin.address]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Returns e.g. 3d, 155d, 4m, 2y
  const formatAge = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diff = now.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'today';
    if (days < 30) return days + 'd';
    if (days < 365) return Math.floor(days / 30) + 'm';
    return Math.floor(days / 365) + 'y';
  };

  const handleTrade = async (coinAddress: `0x${string}`) => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      setError("Please connect your wallet first");
      return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setError("Please enter a valid ETH amount");
      return;
    }
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const { tradeZoraCoin } = await import("@/lib/zora");

      console.log("Starting trade for coin:", coinAddress, "with ETH amount:", ethAmount);

      const result = await tradeZoraCoin({
        coinAddress,
        ethAmount,
        walletClient,
        publicClient,
        userAddress: address,
        isBuying: true, // Always buying with ETH
      });

      console.log("Trade completed successfully:", result);

      if (result?.hash) {
        setTxHash(result.hash);
        setTradeDialogOpen(false); // Close dialog on success
      } else {
        throw new Error("Transaction completed but no hash returned");
      }

    } catch (err: unknown) {
      console.error("Trade error:", err);
      const errorMessage = err instanceof Error ? err.message : "Trade failed with unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('ipfs://')) {
      const hash = imageUrl.replace('ipfs://', '');
      return `https://${GATEWAY_URL}/ipfs/${hash}`;
    }
    return imageUrl;
  };

  return (
    <div
      className={`spotify-card rounded-lg overflow-hidden ${isOwnCoin ? 'ring-2 ring-primary/50' : ''}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Coin Image/Art - Top Section */}
      <div className="relative aspect-square bg-gradient-to-br from-muted/20 to-muted/10">
        {(coinImage || coin.metadata?.image) ? (
          <img
            src={coinImage || getImageSrc(coin.metadata?.image) || ''}
            alt={coin.metadata?.title || coin.name}
            className="w-full h-full object-cover"
            onError={e => {
              console.error('CoinCard image failed to load:', {
                src: e.currentTarget.src,
                alt: e.currentTarget.alt,
                coin,
              });
            }}
            data-testid={`img-coin-${coin.address}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coins className="w-12 h-12 text-primary/40" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 space-y-1">
        <h3 className="font-bold text-sm truncate text-white">
          {coin.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {coin.symbol}
        </p>

        {/* Trade Button - Compact */}
        {!isOwnCoin && (
          <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="spotify-button w-full text-xs h-7 px-2 mt-2"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Trade
              </Button>
            </DialogTrigger>
              <DialogContent className="sm:max-w-xs p-3">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Trade {coin.symbol}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-medium">Coin</span>
                      <span>{coin.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-medium">Symbol</span>
                      <span>${coin.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">Address</span>
                      <span className="font-mono">{formatAddress(coin.address)}</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ethAmount" className="text-xs font-medium">
                      ETH to Trade
                    </Label>
                    <Input
                      id="ethAmount"
                      type="number"
                      step="0.0001"
                      min="0"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      placeholder="ETH amount"
                      className="mt-1 text-xs h-7"
                    />
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-xs">
                    <div className="flex justify-between mb-1">
                      <span>You pay:</span>
                      <span>{ethAmount} ETH</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>You receive:</span>
                      <span>${coin.symbol} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slippage:</span>
                      <span>5%</span>
                    </div>
                  </div>
                  {!isConnected ? (
                    <div className="p-2 bg-yellow-50 rounded-lg text-xs">
                      <p className="text-yellow-800">Please connect your wallet to trade.</p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleTrade(coin.address as `0x${string}`)}
                      disabled={loading || !ethAmount || parseFloat(ethAmount) <= 0}
                      className="w-full text-xs h-7"
                    >
                      {loading ? "Trading..." : `Trade ${ethAmount} ETH`}
                    </Button>
                  )}
                  {error && (
                    <div className="p-2 bg-red-50 rounded-lg text-xs">
                      <p className="text-red-800">❌ {error}</p>
                    </div>
                  )}
                  {txHash && (
                    <div className="p-2 bg-green-50 rounded-lg text-xs">
                      <p className="text-green-800">✅ Success!</p>
                      <a
                        href={`https://basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        data-testid="link-tx-explorer"
                      >
                        View on BaseScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}