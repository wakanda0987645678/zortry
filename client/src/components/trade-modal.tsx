
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ExternalLink, Coins, MessageCircle, User } from "lucide-react";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { formatEther } from "viem";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [balance, setBalance] = useState<string>("0");
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [volume24h, setVolume24h] = useState<string | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState<string | null>(null);
  const [coinImage, setCoinImage] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const GATEWAY_URL = import.meta.env.VITE_NEXT_PUBLIC_GATEWAY_URL || "yellow-patient-cheetah-559.mypinata.cloud";

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
      return `https://${GATEWAY_URL}/ipfs/${hash}`;
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
        
        // Save comment if provided
        if (comment.trim() && coin.address) {
          try {
            await createCommentMutation.mutateAsync({
              coinAddress: coin.address,
              userAddress: address,
              comment: comment.trim(),
              transactionHash: result.hash,
            });
          } catch (error) {
            console.error('Failed to save comment:', error);
          }
        }
        
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
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-sm border-border/50 p-0 overflow-hidden">
        <div className="flex">
          {/* Left side - Coin Image */}
          <div className="w-1/2 bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center p-6">
            {displayImage ? (
              <img
                src={displayImage}
                alt={coin.name}
                className="w-full h-full object-contain max-h-96"
                onError={(e) => {
                  console.error("Trade modal image failed to load:", e.currentTarget.src);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <Coins className="w-20 h-20 text-primary/40" />
              </div>
            )}
          </div>

          {/* Right side - Trading Interface */}
          <div className="w-1/2 p-6 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    @{formatAddress(coin.creator)}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

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
                  disabled={isTrading || !ethAmount || parseFloat(ethAmount) <= 0}
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
          </div>

          {/* Comments Section - Right side below trading interface */}
          <div className="w-1/2 border-t border-border/50 p-4 max-h-64 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-white">
                Recent Trades
              </h4>
              <span className="text-xs text-muted-foreground">
                ({comments?.length || 0})
              </span>
            </div>
            
            <ScrollArea className="h-48">
              {commentsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div 
                      key={c.id} 
                      className="p-2 rounded-lg bg-muted/20 border border-border/30"
                      data-testid={`comment-${c.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                          {c.userAddress.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-white truncate">
                              {c.userAddress.slice(0, 6)}...{c.userAddress.slice(-4)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground break-words">
                            {c.comment}
                          </p>
                          {c.transactionHash && (
                            <a
                              href={`https://basescan.org/tx/${c.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-1 mt-1"
                              data-testid={`link-comment-tx-${c.id}`}
                            >
                              View tx <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No trades yet. Be the first!
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
