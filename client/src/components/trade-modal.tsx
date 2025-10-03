
import { useState } from "react";
import type { Coin } from "@shared/schema";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";

interface TradeModalProps {
  coin: Coin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradeModal({ coin, open, onOpenChange }: TradeModalProps) {
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("0.000111");
  const [comment, setComment] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(true);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const estimatedTokens = parseFloat(ethAmount) * 1000000; // Mock rate

  const handleTrade = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid ETH amount",
        variant: "destructive",
      });
      return;
    }

    setIsTrading(true);
    
    try {
      const { tradeZoraCoin } = await import("@/lib/zora");
      
      console.log("Starting trade from modal for coin:", coin.address, "with ETH amount:", ethAmount);
      
      const result = await tradeZoraCoin({
        coinAddress: coin.address as `0x${string}`,
        ethAmount,
        walletClient,
        publicClient,
        userAddress: address,
        isBuying,
      });
      
      console.log("Trade completed successfully from modal:", result);
      
      if (result?.hash) {
        setTxHash(result.hash);
        
        toast({
          title: "Trade successful!",
          description: `You ${isBuying ? 'received' : 'sold'} ${estimatedTokens.toLocaleString()} ${coin.symbol} tokens`,
        });
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
    setEthAmount(amount);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold">{coin.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">@{formatAddress(coin.creator)}</p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsBuying(true)}
              className={`flex-1 ${isBuying ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              disabled={isTrading || !!txHash}
            >
              Buy
            </Button>
            <Button
              onClick={() => setIsBuying(false)}
              className={`flex-1 ${!isBuying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              disabled={isTrading || !!txHash}
            >
              Sell
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="text-sm font-semibold text-green-500">▲ $757.53</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">24H Volume</p>
              <p className="text-sm font-semibold">💰 $2.30</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Creator Earnings</p>
              <p className="text-sm font-semibold">💎 $0.02</p>
            </div>
          </div>

          {/* Balance Display */}
          <div className="flex justify-end">
            <p className="text-sm text-muted-foreground">Balance: <span className="text-white font-medium">0 ETH</span></p>
          </div>

          {/* Amount Input */}
          <div>
            <div className="relative">
              <Input
                type="number"
                step="0.000001"
                min="0"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="text-3xl font-bold h-16 pr-24 bg-muted/50 border-border text-white"
                disabled={isTrading || !!txHash}
                data-testid="input-eth-amount"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Ξ</div>
                <span className="text-sm font-semibold text-white">ETH</span>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickAmount("0.001")}
              disabled={isTrading || !!txHash}
              className="bg-muted/30 hover:bg-muted/50 border-border text-white"
            >
              0.001 ETH
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickAmount("0.01")}
              disabled={isTrading || !!txHash}
              className="bg-muted/30 hover:bg-muted/50 border-border text-white"
            >
              0.01 ETH
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickAmount("0.1")}
              disabled={isTrading || !!txHash}
              className="bg-muted/30 hover:bg-muted/50 border-border text-white"
            >
              0.1 ETH
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickAmount("1.0")}
              disabled={isTrading || !!txHash}
              className="bg-muted/30 hover:bg-muted/50 border-border text-white"
            >
              Max
            </Button>
          </div>

          {/* Comment Input */}
          <div>
            <Input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-muted/50 border-border text-white placeholder:text-muted-foreground"
              disabled={isTrading || !!txHash}
            />
          </div>

          {/* Action Button */}
          {!txHash ? (
            !isConnected ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-600 text-center">Please connect your wallet to trade</p>
              </div>
            ) : (
              <Button
                className={`w-full h-14 text-lg font-bold ${isBuying ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
                onClick={handleTrade}
                disabled={isTrading || !ethAmount || parseFloat(ethAmount) <= 0}
                data-testid="button-confirm-trade"
              >
                {isTrading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Trading...
                  </>
                ) : (
                  isBuying ? 'Buy' : 'Sell'
                )}
              </Button>
            )
          ) : (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-400 mb-2">Transaction Successful!</div>
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    data-testid="link-tx-explorer"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
