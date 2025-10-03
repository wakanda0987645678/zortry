"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  ExternalLink,
  Calendar,
  User,
  Coins,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import TradeModal from "@/components/trade-modal";
import "@/lib/zora";

const GATEWAY_URL =
  import.meta.env.VITE_NEXT_PUBLIC_GATEWAY_URL ||
  "yellow-patient-cheetah-559.mypinata.cloud";

interface CoinStatsIconsProps {
  price?: string | null;
  marketCap?: string | null;
  volume24h?: string | null;
  uniqueHolders?: number | null;
  earnings?: string | null;
}

function CoinStatsIcons({
  price,
  marketCap,
  volume24h,
  uniqueHolders,
  earnings,
}: CoinStatsIconsProps) {
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
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [volume24h, setVolume24h] = useState<string | null>(null);
  const [uniqueHolders, setUniqueHolders] = useState<number | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState<Array<{
    amount: {
      currencyAddress: string;
      amountRaw: string;
      amountDecimal: number;
    };
    amountUsd?: string;
  }> | null>(null);
  const [coinImage, setCoinImage] = useState<string | null>(null);

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
        if (e && typeof e === "object") {
          console.error("Error details:", JSON.stringify(e, null, 2));
        }
      }
    }
    if (typeof window !== "undefined") fetchCoinStats();
    return () => {
      isMounted = false;
    };
  }, [coin.address]);

  

  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("ipfs://")) {
      const hash = imageUrl.replace("ipfs://", "");
      return `https://${GATEWAY_URL}/ipfs/${hash}`;
    }
    return imageUrl;
  };

  return (
    <div
      className={`spotify-card rounded-2xl overflow-hidden ${isOwnCoin ? "ring-1 ring-primary/20" : ""} h-full flex flex-col`}
    >
      {/* Coin Image/Art - Top Section - Clickable */}
      <div
        onClick={() => !isOwnCoin && setTradeDialogOpen(true)}
        className={`relative w-full h-40 bg-gradient-to-br from-muted/20 to-muted/10 ${!isOwnCoin ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
      >
        {coinImage || coin.metadata?.image ? (
          <img
            src={coinImage || getImageSrc(coin.metadata?.image) || ""}
            alt={coin.metadata?.title || coin.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error("CoinCard image failed to load:", {
                src: e.currentTarget.src,
                alt: e.currentTarget.alt,
                coin,
              });
            }}
            data-testid={`img-coin-${coin.address}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coins className="w-8 h-8 text-primary/40" />
          </div>
        )}
        {!isOwnCoin && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <TrendingUp className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {!isOwnCoin && (
        <TradeModal
          coin={coin as any}
          open={tradeDialogOpen}
          onOpenChange={setTradeDialogOpen}
        />
      )}

      {/* Content Section */}
      <div className="p-2 space-y-1.5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-xs truncate text-white">{coin.name}</h3>
          <p className="text-[10px] text-muted-foreground truncate">
            {coin.symbol}
          </p>
        </div>

        {/* Stats Section */}
        <div className="space-y-1 pt-1.5 border-t border-border/50">
          {/* Market Cap and Creator */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-0.5">
              <Coins className="h-2.5 w-2.5 text-blue-500" />
              <span className="text-muted-foreground">MC:</span>
              <span className="font-semibold text-white">
                {marketCap ? `$${marketCap}` : "-"}
              </span>
            </div>
            <div className="flex items-center gap-1" title={coin.creator}>
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[7px] font-bold text-white">
                {coin.creator.slice(2, 4).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Earnings and Holders */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5 text-green-500" />
              <span className="text-muted-foreground">Earn:</span>
              <span className="font-semibold text-white">
                {creatorEarnings && creatorEarnings.length > 0
                  ? `$${parseFloat(creatorEarnings[0].amountUsd || "0").toFixed(2)}`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <User className="h-2.5 w-2.5 text-orange-500" />
              <span className="font-semibold text-white">
                {uniqueHolders || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
