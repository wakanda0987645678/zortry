import { useState, useEffect } from "react";
import type { Coin, Comment } from "@shared/schema";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ExternalLink, Coins, MessageCircle, Users, Activity as ActivityIcon, Info, Copy, Check, TrendingUp } from "lucide-react";
import { getCoin, getCoinHolders } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { formatEther } from "viem";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface TradeModalProps {
  coin: Coin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradeModal({ coin, open, onOpenChange }: TradeModalProps) {
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("0.000111");
  const [isTrading, setIsTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(true);
  const [comment, setComment] = useState("");
  const [standaloneComment, setStandaloneComment] = useState("");
  const [balance, setBalance] = useState<string>("0");
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [volume24h, setVolume24h] = useState<string | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState<string | null>(null);
  const [coinImage, setCoinImage] = useState<string | null>(null);
  const [holders, setHolders] = useState<Array<{
    address: string;
    balance: string;
    percentage: number;
    profile?: string | null;
  }>>([]);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);
  const [uniqueHoldersCount, setUniqueHoldersCount] = useState<number>(0);
  const [chartData, setChartData] = useState<Array<{ time: string; price: number }>>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | 'W' | 'M' | 'All'>('1D');
  const [priceChange, setPriceChange] = useState<number>(0);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const GATEWAY_URLS = [
    "ipfs.io",
    "cloudflare-ipfs.com",
    "gateway.pinata.cloud",
  ];

  const [copiedAddress, setCopiedAddress] = useState(false);

  // Fetch comments for this coin
  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['/api/comments/coin', coin.address],
    enabled: open && !!coin.address,
  });

  // Mutation for creating a comment
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { coinAddress: string; userAddress: string; comment: string; transactionHash?: string }) => {
      return await apiRequest('POST', '/api/comments', commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments/coin', coin.address] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleStandaloneComment = async () => {
    if (!isConnected || !address || !coin.address || !standaloneComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        coinAddress: coin.address,
        userAddress: address,
        comment: standaloneComment.trim(),
      });

      setStandaloneComment("");

      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: "Failed to post comment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Fetch user balance
  useEffect(() => {
    async function fetchBalance() {
      if (!address || !publicClient) return;

      try {
        const bal = await publicClient.getBalance({ address });
        setBalance(formatEther(bal));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }

    if (isConnected && open) {
      fetchBalance();
    }
  }, [address, isConnected, publicClient, open]);

  // Fetch chart data
  useEffect(() => {
    async function fetchChartData() {
      if (!coin.address) return;

      try {
        // Get the time range for the chart
        const now = Date.now();
        let startTime: number;

        switch (timeframe) {
          case '1H':
            startTime = now - (60 * 60 * 1000);
            break;
          case '1D':
            startTime = now - (24 * 60 * 60 * 1000);
            break;
          case 'W':
            startTime = now - (7 * 24 * 60 * 60 * 1000);
            break;
          case 'M':
            startTime = now - (30 * 24 * 60 * 60 * 1000);
            break;
          case 'All':
            startTime = 0;
            break;
        }

        // Fetch historical price data from Zora
        const response = await fetch(`https://api.zora.co/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_NEXT_PUBLIC_ZORA_API_KEY || ''}`,
          },
          body: JSON.stringify({
            query: `
              query GetCoinPriceHistory($address: String!, $chainId: Int!) {
                zora20Token(address: $address, chainId: $chainId) {
                  priceHistory {
                    timestamp
                    priceUsd
                  }
                }
              }
            `,
            variables: {
              address: coin.address.toLowerCase(),
              chainId: base.id,
            },
          }),
        });

        const data = await response.json();
        const priceHistory = data?.data?.zora20Token?.priceHistory || [];

        if (priceHistory.length > 0) {
          // Filter by timeframe and format data
          const filtered = priceHistory
            .filter((point: any) => point.timestamp >= startTime)
            .map((point: any) => ({
              time: new Date(point.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              price: parseFloat(point.priceUsd || '0'),
            }));

          setChartData(filtered);

          // Calculate price change percentage
          if (filtered.length >= 2) {
            const firstPrice = filtered[0].price;
            const lastPrice = filtered[filtered.length - 1].price;
            const change = ((lastPrice - firstPrice) / firstPrice) * 100;
            setPriceChange(change);
          }
        } else {
          // Fallback: generate sample data points from market cap if no history
          setChartData([
            { time: '12:00 AM', price: 0.001 },
            { time: '6:00 AM', price: 0.0015 },
            { time: '12:00 PM', price: 0.002 },
            { time: '6:00 PM', price: parseFloat(marketCap || '0') / 1000000 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Use fallback data
        setChartData([
          { time: '12:00 AM', price: 0.001 },
          { time: '6:00 AM', price: 0.0015 },
          { time: '12:00 PM', price: 0.002 },
          { time: '6:00 PM', price: parseFloat(marketCap || '0') / 1000000 },
        ]);
      }
    }

    if (open && marketCap) {
      fetchChartData();
    }
  }, [coin.address, open, timeframe, marketCap]);

  // Fetch coin stats
  useEffect(() => {
    async function fetchCoinStats() {
      if (!coin.address) return;

      try {
        const response = await getCoin({
          address: coin.address as `0x${string}`,
          chain: base.id,
        });

        const coinData = response.data?.zora20Token;

        if (coinData) {
          // Set market cap
          if (coinData.marketCap) {
            setMarketCap(parseFloat(coinData.marketCap).toFixed(2));
          }

          // Set 24h volume
          if (coinData.volume24h) {
            setVolume24h(parseFloat(coinData.volume24h).toFixed(2));
          }

          // Set creator earnings
          if (coinData.creatorEarnings && coinData.creatorEarnings.length > 0) {
            const earnings = coinData.creatorEarnings[0];
            setCreatorEarnings(earnings.amountUsd || earnings.amount?.amountDecimal?.toString() || "0");
          }

          // Set coin image
          if (coinData.mediaContent?.previewImage) {
            const previewImage = coinData.mediaContent.previewImage as any;
            setCoinImage(previewImage.medium || previewImage.small || null);
          }

          // Set total supply and unique holders
          if (coinData.totalSupply) {
            setTotalSupply(coinData.totalSupply);
          }

          if (coinData.uniqueHolders !== undefined) {
            setUniqueHoldersCount(coinData.uniqueHolders);
          }
        }

        // Fetch holder details
        const holdersResponse = await getCoinHolders({
          chainId: base.id,
          address: coin.address as `0x${string}`,
          count: 50, // Get top 50 holders
        });

        const holderBalances = holdersResponse.data?.zora20Token?.tokenBalances?.edges || [];
        const supply = parseFloat(coinData?.totalSupply || "0");

        if (holderBalances.length > 0 && supply > 0) {
          const processedHolders = holderBalances.map((edge: any) => {
            const balance = parseFloat(edge.node.balance || "0");
            const percentage = (balance / supply) * 100;

            return {
              address: edge.node.ownerAddress,
              balance: edge.node.balance,
              percentage: percentage,
              profile: edge.node.ownerProfile?.handle || null,
            };
          });

          setHolders(processedHolders);
        }
      } catch (error) {
        console.error("Error fetching coin stats:", error);
      }
    }

    if (open) {
      fetchCoinStats();
    }
  }, [coin.address, open]);

  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("ipfs://")) {
      const hash = imageUrl.replace("ipfs://", "");
      return `https://${GATEWAY_URLS[0]}/ipfs/${hash}`;
    }
    if (imageUrl.includes("yellow-patient-cheetah-559.mypinata.cloud")) {
      const hash = imageUrl.split("/ipfs/")[1];
      if (hash) {
        return `https://${GATEWAY_URLS[0]}/ipfs/${hash}`;
      }
    }
    return imageUrl;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleTrade = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const ethAmountNum = parseFloat(ethAmount);
    if (!ethAmount || ethAmountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid ETH amount",
        variant: "destructive",
      });
      return;
    }

    // Check balance
    const balanceNum = parseFloat(balance);
    if (isBuying && ethAmountNum > balanceNum) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${parseFloat(balance).toFixed(6)} ETH`,
        variant: "destructive",
      });
      return;
    }

    setIsTrading(true);

    try {
      const { tradeZoraCoin } = await import("@/lib/zora");

      const result = await tradeZoraCoin({
        coinAddress: coin.address as `0x${string}`,
        ethAmount,
        walletClient,
        publicClient,
        userAddress: address,
        isBuying,
      });

      if (result?.hash) {
        setTxHash(result.hash);

        // Always save trade record (with or without comment)
        if (coin.address) {
          try {
            await createCommentMutation.mutateAsync({
              coinAddress: coin.address,
              userAddress: address,
              comment: comment.trim() || `Traded ${coin.symbol}`,
              transactionHash: result.hash,
            });
          } catch (error) {
            console.error('Failed to save trade record:', error);
            toast({
              title: "Trade record not saved",
              description: "Your trade was successful but the activity record could not be saved",
              variant: "destructive",
            });
          }
        }

        // Create notification for the trade
        const notificationType = isBuying ? 'buy' : 'sell';
        const notificationTitle = isBuying ? 'Coin Purchase Successful' : 'Coin Sale Successful';
        // Ensure amounts are parsed correctly for notification message
        const amountFormatted = formatEther(BigInt(result.amountReceived || result.amountSent || '0')); // Use appropriate field based on buy/sell
        const totalCostFormatted = formatEther(BigInt(result.transaction.value || '0')); // Use transaction value for total cost

        const notificationMessage = isBuying
          ? `You bought ${amountFormatted} ${coin.symbol} for ${totalCostFormatted} ETH`
          : `You sold ${amountFormatted} ${coin.symbol} for ${totalCostFormatted} ETH`;

        await apiRequest('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: address,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            coinAddress: coin.address,
            coinSymbol: coin.symbol,
            amount: amountFormatted, // Use formatted amount
            transactionHash: result.hash,
            read: false
          })
        });


        toast({
          title: "Trade successful!",
          description: `You ${isBuying ? 'bought' : 'sold'} ${coin.symbol} tokens${comment ? ` - ${comment}` : ''}`,
        });

        // Refresh balance
        const newBal = await publicClient.getBalance({ address });
        setBalance(formatEther(newBal));
      } else {
        throw new Error("Transaction completed but no hash returned");
      }

    } catch (error) {
      console.error("Trade failed:", error);

      const errorMessage = error instanceof Error ? error.message : "Trade failed";

      toast({
        title: "Trade failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleClose = () => {
    setTxHash(null);
    setEthAmount("0.000111");
    setComment("");
    onOpenChange(false);
  };

  const setQuickAmount = (amount: string) => {
    if (amount === 'Max') {
      // Set to 90% of balance to leave some for gas
      const maxAmount = (parseFloat(balance) * 0.9).toFixed(6);
      setEthAmount(maxAmount);
    } else {
      setEthAmount(amount);
    }
  };

  const displayImage = coinImage || getImageSrc((coin as any).metadata?.image);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl bg-card/95 backdrop-blur-sm border-border/50 p-0 overflow-hidden">
        <div className="flex min-h-[500px]">
          {/* Left side - Price Chart */}
          <div className="w-5/12 bg-gradient-to-br from-muted/20 to-muted/10 flex flex-col p-6">
            {/* Market Cap and Price Change */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Market cap</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white">
                  ${marketCap || '0'}
                </h3>
                <span className={`text-sm font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                  <XAxis
                    dataKey="time"
                    stroke="#888"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(value) => `$${value.toFixed(4)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${value.toFixed(6)}`, 'Price']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-2 mt-4">
              {(['1H', '1D', 'W', 'M', 'All'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 h-8 text-xs ${
                    timeframe === tf
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>

            {/* Toggle between chart and image */}
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-xs text-muted-foreground hover:text-white"
                onClick={() => {
                  // Could add state to toggle between chart and image
                }}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Chart
              </Button>
            </div>
          </div>

          {/* Right side - Tabbed Interface */}
          <div className="w-7/12 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-3">
              <DialogTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    @{formatAddress(coin.creator)}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="trade" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-6">
                <TabsTrigger value="trade" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Trade
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="holders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Holders
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trade" className="flex-1 px-6 pb-6 flex flex-col mt-0 pt-4">{/* Trade Tab Content */}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="text-sm font-bold text-green-500">
                  {marketCap ? `$${marketCap}` : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24H Volume</p>
                <p className="text-sm font-semibold text-white">
                  {volume24h ? `$${volume24h}` : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Creator Earnings</p>
                <p className="text-sm font-semibold text-white">
                  {creatorEarnings ? `$${parseFloat(creatorEarnings).toFixed(2)}` : 'Loading...'}
                </p>
              </div>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setIsBuying(true)}
                className={`flex-1 h-10 text-sm font-bold transition-all ${
                  isBuying
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50 border border-border/30'
                }`}
                disabled={isTrading || !!txHash}
                variant={isBuying ? "default" : "outline"}
              >
                Buy
              </Button>
              <Button
                onClick={() => setIsBuying(false)}
                className={`flex-1 h-10 text-sm font-bold transition-all ${
                  !isBuying
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-transparent text-muted-foreground hover:bg-muted/50 border border-border/30'
                }`}
                disabled={isTrading || !!txHash}
                variant={!isBuying ? "default" : "outline"}
              >
                Sell
              </Button>
            </div>

            {/* Amount Input */}
            <div className="mb-3">
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="h-14 text-2xl font-bold pr-20 bg-muted/30 border-border/50 text-white"
                  disabled={isTrading || !!txHash}
                  data-testid="input-eth-amount"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    Ξ
                  </div>
                  <span className="text-sm font-semibold text-white">ETH</span>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['0.001', '0.01', '0.1', 'Max'].map((label) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(label)}
                  disabled={isTrading || !!txHash}
                  className="h-9 text-xs bg-muted/20 hover:bg-muted/40 border-border/30 text-white"
                >
                  {label === 'Max' ? label : `${label} ETH`}
                </Button>
              ))}
            </div>

            {/* Comment Input */}
            <div className="mb-4">
              <Input
                placeholder="Add a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-10 bg-muted/20 border-border/30 text-white placeholder:text-muted-foreground"
                disabled={isTrading || !!txHash}
                maxLength={200}
              />
            </div>

            {/* Action Button */}
            {!txHash ? (
              !isConnected ? (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-500 text-center font-medium">
                    Please connect your wallet to trade
                  </p>
                </div>
              ) : (
                <Button
                  className={`w-full h-12 text-base font-bold transition-all ${
                    isBuying
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                  onClick={handleTrade}
                  disabled={isTrading || createCommentMutation.isPending || !ethAmount || parseFloat(ethAmount) <= 0}
                  data-testid="button-confirm-trade"
                >
                  {isTrading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Trading...
                    </>
                  ) : (
                    `${isBuying ? 'Buy' : 'Sell'} ${coin.symbol}`
                  )}
                </Button>
              )
            ) : (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-green-400 text-sm mb-2">
                      Transaction Successful!
                    </div>
                    <a
                      href={`https://basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      data-testid="link-tx-explorer"
                    >
                      View on BaseScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Balance */}
            <div className="mt-auto pt-4 text-xs text-muted-foreground text-right">
              Balance: {parseFloat(balance).toFixed(6)} ETH
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="flex-1 px-6 pb-6 mt-0 pt-4">
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  className="h-10 bg-muted/20 border-border/30 text-white placeholder:text-muted-foreground flex-1"
                  disabled={!isConnected || createCommentMutation.isPending}
                  value={standaloneComment}
                  onChange={(e) => setStandaloneComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleStandaloneComment();
                    }
                  }}
                />
                <Button
                  onClick={handleStandaloneComment}
                  disabled={!isConnected || createCommentMutation.isPending || !standaloneComment.trim()}
                  className="h-10"
                >
                  {createCommentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Connect your wallet to comment
                </p>
              )}
            </div>

            <ScrollArea className="h-[350px]">
              {commentsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-muted/20 border border-border/30"
                      data-testid={`comment-${c.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {c.userAddress.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white truncate">
                              {c.userAddress.slice(0, 6)}...{c.userAddress.slice(-4)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground break-words">
                            {c.comment}
                          </p>
                          {c.transactionHash && (
                            <a
                              href={`https://basescan.org/tx/${c.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mt-2"
                              data-testid={`link-comment-tx-${c.id}`}
                            >
                              View transaction <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">No comments yet</p>
                  <p className="text-xs text-muted-foreground">
                    Be the first to add a comment
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Holders Tab */}
          <TabsContent value="holders" className="flex-1 px-6 pb-6 mt-0 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Holders</p>
                <p className="text-xl font-bold text-white">{uniqueHoldersCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Supply</p>
                <p className="text-xl font-bold text-white">
                  {totalSupply ? parseFloat(totalSupply).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                </p>
              </div>
            </div>

            <ScrollArea className="h-[360px]">
              {holders.length > 0 ? (
                <div className="space-y-2">
                  {holders.map((holder, index) => {
                    const isCreator = holder.address.toLowerCase() === coin.creator.toLowerCase();

                    // Format token balance - convert from wei-like units and format compactly
                    const tokenBalance = parseFloat(holder.balance);
                    let formattedBalance: string;

                    if (tokenBalance > 1e18) {
                      // Very large numbers (wei units) - convert to standard units
                      formattedBalance = (tokenBalance / 1e18).toLocaleString(undefined, { 
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2 
                      });
                    } else if (tokenBalance > 1e6) {
                      // Millions
                      formattedBalance = (tokenBalance / 1e6).toFixed(2) + 'M';
                    } else if (tokenBalance > 1e3) {
                      // Thousands
                      formattedBalance = (tokenBalance / 1e3).toFixed(2) + 'K';
                    } else {
                      formattedBalance = tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    }

                    // Format percentage - handle edge cases properly
                    let formattedPercentage: string;
                    if (holder.percentage < 0.01 && holder.percentage > 0) {
                      formattedPercentage = '<0.01';
                    } else if (holder.percentage >= 100 || isNaN(holder.percentage)) {
                      // If data is inconsistent, calculate from total holders instead
                      const totalHoldersBalance = holders.reduce((sum, h) => sum + parseFloat(h.balance), 0);
                      const actualPercentage = totalHoldersBalance > 0 
                        ? (tokenBalance / totalHoldersBalance) * 100 
                        : 0;
                      formattedPercentage = actualPercentage.toFixed(2);
                    } else {
                      formattedPercentage = holder.percentage.toFixed(2);
                    }


                    return (
                      <div
                        key={holder.address}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors border-b border-border/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-[30px]">
                            <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                          </div>
                          <div className={`w-10 h-10 rounded-full ${
                            index === 0
                              ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                              : isCreator
                                ? 'bg-gradient-to-br from-primary to-secondary'
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          } flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                            {holder.address.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white">
                                {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                              </p>
                              {isCreator && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                  Creator
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formattedBalance} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            {formattedPercentage}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">Loading holders...</p>
                  <p className="text-xs text-muted-foreground">
                    Fetching holder information from blockchain
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="flex-1 px-6 pb-6 mt-0 pt-4">
            <ScrollArea className="h-[420px]">
              {commentsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments && comments.filter(c => c.transactionHash).length > 0 ? (
                <div className="space-y-2">
                  {comments.filter(c => c.transactionHash).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/10 transition-colors border-b border-border/30"
                      data-testid={`activity-${c.id}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {c.userAddress.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white truncate">
                            {c.userAddress.slice(0, 8)}...
                          </span>
                          <span className="text-xs font-bold text-green-500">
                            Traded
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleTimeString()} • {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {c.comment && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{c.comment}"
                          </p>
                        )}
                      </div>
                      <a
                        href={`https://basescan.org/tx/${c.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary/70 hover:text-primary flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <ActivityIcon className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">No trades yet</p>
                  <p className="text-xs text-muted-foreground">
                    Trading activity will appear here
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 px-6 pb-6 mt-0 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {new Date(coin.createdAt).toLocaleDateString()}
                </span>
              </div>

              {coin.address && (
                <div className="flex items-center justify-between py-3 border-b border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm">Contract address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">
                      {coin.address.slice(0, 6)}...{coin.address.slice(-4)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(coin.address!)}
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      {copiedAddress ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ActivityIcon className="w-4 h-4" />
                  <span className="text-sm">Chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">B</span>
                  </div>
                  <span className="text-sm font-medium text-white">Base</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Creator</span>
                </div>
                <span className="text-sm font-mono text-white">
                  {coin.creator.slice(0, 6)}...{coin.creator.slice(-4)}
                </span>
              </div>

              {(coin as any).metadata?.originalUrl && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Original post</span>
                  </div>
                  <a
                    href={(coin as any).metadata.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}