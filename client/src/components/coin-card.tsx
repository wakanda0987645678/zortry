
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

  // Fixed card size for uniformity
  const CARD_WIDTH = 241;
  const CARD_HEIGHT = 375;
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ethAmount, setEthAmount] = useState("0.0001");
  const [price, setPrice] = useState<string | null>(null);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [volume24h, setVolume24h] = useState<string | null>(null);
  const [uniqueHolders, setUniqueHolders] = useState<number | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState<Array<{ amount: { currencyAddress: string; amountRaw: string; amountDecimal: number }; amountUsd?: string }> | null>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  useEffect(() => {
    let isMounted = true;
    async function fetchCoinStats() {
      try {
        const ZORA_API_KEY = import.meta.env.VITE_ZORA_API_KEY;
        if (!ZORA_API_KEY) {
          console.warn("ZORA_API_KEY not configured");
          return;
        }

        // Mock stats for now since we don't have the actual Zora SDK implementation
        if (isMounted) {
          setPrice("0.001");
          setMarketCap("10000");
          setVolume24h("500");
          setUniqueHolders(42);
          setCreatorEarnings([{
            amount: {
              currencyAddress: "0x0000000000000000000000000000000000000000",
              amountRaw: "1000000000000000000",
              amountDecimal: 1
            },
            amountUsd: "3000"
          }]);
        }
      } catch (e) {
        console.error("Error fetching coin stats:", e);
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
    if (!isConnected || !address) {
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
      // Mock trade implementation - replace with actual Zora SDK when available
      console.log("Trading", ethAmount, "ETH for", coinAddress);
      
      // Simulate a transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      setTxHash(mockTxHash);
      
    } catch (err: unknown) {
      console.error("Trade error:", err);
      setError((err as Error).message || "Trade failed");
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
    <Card
      className={`hover:shadow-lg transition-shadow ${isOwnCoin ? 'border-purple-200 bg-purple-50/50' : ''}`}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, minWidth: CARD_WIDTH, minHeight: CARD_HEIGHT, maxWidth: CARD_WIDTH, maxHeight: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}
    >
      <CardHeader className="pb-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-1 text-base font-semibold truncate">
              <Coins className="h-4 w-4" />
              <span className="truncate">{coin.name}</span>
              {isOwnCoin && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 ml-1">by you</Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
              <span className="truncate">{formatAddress(coin.address)}</span>
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCopy(coin.address)}
            className="ml-1 h-7 w-7"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-2 px-3 py-2">
        {/* Stats with icons */}
        <CoinStatsIcons
          price={price}
          marketCap={marketCap}
          volume24h={volume24h}
          uniqueHolders={uniqueHolders}
          earnings={creatorEarnings && creatorEarnings.length > 0 ? `${creatorEarnings[0].amount.amountDecimal} (${creatorEarnings[0].amount.currencyAddress})${creatorEarnings[0].amountUsd ? ` ≈ $${creatorEarnings[0].amountUsd}` : ''}` : null}
        />
        
        {/* Blog Metadata (compact) */}
        {coin.metadata && (
          <div className="space-y-1">
            {coin.metadata.title && (
              <div className="truncate text-xs text-gray-800 font-medium">{coin.metadata.title}</div>
            )}
            {coin.metadata.description && (
              <div className="truncate text-xs text-gray-500">{coin.metadata.description}</div>
            )}
            {coin.metadata.image && (
              <div className="rounded-md overflow-hidden" style={{ width: '100%', height: 100 }}>
                <img
                  src={getImageSrc(coin.metadata.image) || ''}
                  alt={coin.metadata.title || coin.name}
                  width={CARD_WIDTH}
                  height={100}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    console.error('CoinCard image failed to load:', {
                      src: e.currentTarget.src,
                      alt: e.currentTarget.alt,
                      coin,
                    });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Coin Details (compact) */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 mt-1">
          <div className="flex items-center gap-1 text-gray-600">
            <User className="h-3 w-3" />
            <span>Creator</span>
          </div>
          <span className="font-mono">{formatAddress(coin.creator)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-semibold">Symbol</span>: {coin.symbol}
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{formatAge(coin.createdAt)}</span>
          </div>
        </div>

        {/* Actions (compact) */}
        <div className="flex gap-1 pt-1">
          {!isOwnCoin && (
            <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 px-1 py-1 text-xs h-7 bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-blue-400"
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
                        href={`https://explorer.zora.energy/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        data-testid="link-tx-explorer"
                      >
                        View on Zora Explorer
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
