
import { useState, useEffect } from "react";
import type { Coin } from "@shared/schema";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { formatEther } from "viem";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface MobileTradeModalProps {
  coin: Coin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileTradeModal({ coin, open, onOpenChange }: MobileTradeModalProps) {
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(true);
  const [comment, setComment] = useState("");
  const [balance, setBalance] = useState<string>("0");

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Mutation for creating a comment
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { coinAddress: string; userAddress: string; comment: string; transactionHash?: string }) => {
      return await apiRequest('POST', '/api/comments', commentData);
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

        // Save trade record with comment
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
          }
        }

        // Create notification
        const notificationType = isBuying ? 'buy' : 'sell';
        const notificationTitle = isBuying ? 'Coin Purchase Successful' : 'Coin Sale Successful';
        const amountFormatted = formatEther(BigInt(result.amountReceived || result.amountSent || '0'));
        const totalCostFormatted = formatEther(BigInt(result.transaction.value || '0'));

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
            amount: amountFormatted,
            transactionHash: result.hash,
            read: false
          })
        });

        toast({
          title: "Trade successful!",
          description: `You ${isBuying ? 'bought' : 'sold'} ${coin.symbol} tokens`,
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
    setEthAmount("");
    setComment("");
    onOpenChange(false);
  };

  const setQuickAmount = (percentage: number) => {
    if (percentage === 100) {
      // Set to 90% of balance to leave some for gas
      const maxAmount = (parseFloat(balance) * 0.9).toFixed(6);
      setEthAmount(maxAmount);
    } else {
      const amount = (parseFloat(balance) * percentage / 100 * 0.9).toFixed(6);
      setEthAmount(amount);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="bg-background border-t border-border/50 pb-6">
        <DrawerHeader className="px-4 pt-4 pb-3">
          <DrawerTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-foreground">
                {coin.symbol.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{coin.name}</h3>
                <p className="text-xs text-muted-foreground">@{formatAddress(coin.creator)}</p>
              </div>
            </div>
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsBuying(true)}
                className={`px-6 py-2 text-base font-bold rounded-full transition-all ${
                  isBuying
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-transparent text-muted-foreground border border-border/30 hover:bg-muted/50'
                }`}
                disabled={isTrading || !!txHash}
              >
                Buy
              </Button>
              <Button
                onClick={() => setIsBuying(false)}
                className={`px-6 py-2 text-base font-bold rounded-full transition-all ${
                  !isBuying
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'bg-transparent text-muted-foreground border border-border/30 hover:bg-muted/50'
                }`}
                disabled={isTrading || !!txHash}
              >
                Sell
              </Button>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-semibold text-foreground">
                {parseFloat(balance).toFixed(4)} ETH
              </p>
            </div>
          </div>

          {/* Amount Input with Token Icon */}
          <div className="relative">
            <Input
              type="number"
              step="0.000001"
              min="0"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="h-16 text-2xl font-bold pr-24 bg-muted/30 border-border/50 text-foreground rounded-2xl"
              disabled={isTrading || !!txHash}
              placeholder="0.0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">Ξ</span>
              </div>
              <span className="text-base font-semibold text-foreground">ETH</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                variant="outline"
                size="sm"
                onClick={() => setQuickAmount(percentage)}
                disabled={isTrading || !!txHash}
                className="h-10 text-sm bg-muted/20 hover:bg-muted/40 border-border/30 text-foreground rounded-xl font-semibold"
              >
                {percentage === 100 ? 'Max' : `${percentage}%`}
              </Button>
            ))}
          </div>

          {/* Comment Input */}
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] bg-muted/20 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl resize-none"
            disabled={isTrading || !!txHash}
            maxLength={280}
          />

          {/* Action Button */}
          {!txHash ? (
            !isConnected ? (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-yellow-500 text-center font-medium">
                  Please connect your wallet to trade
                </p>
              </div>
            ) : (
              <Button
                className={`w-full h-14 text-lg font-bold transition-all rounded-2xl ${
                  isBuying
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-pink-500 hover:bg-pink-600'
                } text-white`}
                onClick={handleTrade}
                disabled={isTrading || createCommentMutation.isPending || !ethAmount || parseFloat(ethAmount) <= 0}
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
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-green-400 text-base mb-2">
                    Transaction Successful!
                  </div>
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
