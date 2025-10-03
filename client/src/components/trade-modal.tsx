
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
import { Loader2, CheckCircle2, ExternalLink, TrendingUp, TrendingDown, Coins, User } from "lucide-react";

interface TradeModalProps {
  coin: Coin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradeModal({ coin, open, onOpenChange }: TradeModalProps) {
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("0.0001");
  const [isTrading, setIsTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(true);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const estimatedTokens = parseFloat(ethAmount) * 1000000;

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
        
        toast({
          title: "Trade successful!",
          description: `You ${isBuying ? 'bought' : 'sold'} ${coin.symbol} tokens`,
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
    setEthAmount("0.0001");
    onOpenChange(false);
  };

  const setQuickAmount = (amount: string) => {
    setEthAmount(amount);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/50">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{coin.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {coin.symbol} · {formatAddress(coin.creator)}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsBuying(true)}
              className={`flex-1 h-9 text-sm font-semibold transition-all ${
                isBuying 
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30' 
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
              disabled={isTrading || !!txHash}
              variant="outline"
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Buy
            </Button>
            <Button
              onClick={() => setIsBuying(false)}
              className={`flex-1 h-9 text-sm font-semibold transition-all ${
                !isBuying 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' 
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
              disabled={isTrading || !!txHash}
              variant="outline"
            >
              <TrendingDown className="w-4 h-4 mr-1.5" />
              Sell
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-blue-500" />
              <div>
                <p className="text-[10px] text-muted-foreground">Market Cap</p>
                <p className="text-xs font-semibold text-white">-</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-orange-500" />
              <div>
                <p className="text-[10px] text-muted-foreground">Holders</p>
                <p className="text-xs font-semibold text-white">-</p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Amount to {isBuying ? 'Buy' : 'Sell'}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="h-12 text-xl font-bold pr-16 bg-muted/30 border-border/50 text-white"
                disabled={isTrading || !!txHash}
                data-testid="input-eth-amount"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                  Ξ
                </div>
                <span className="text-sm font-semibold text-white">ETH</span>
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {['0.0001', '0.001', '0.01', '0.1'].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setQuickAmount(amount)}
                disabled={isTrading || !!txHash}
                className="h-8 text-xs bg-muted/20 hover:bg-muted/40 border-border/30 text-white"
              >
                {amount}
              </Button>
            ))}
          </div>

          {/* Trade Info */}
          <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You {isBuying ? 'pay' : 'receive'}:</span>
              <span className="font-semibold text-white">{ethAmount} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage:</span>
              <span className="font-semibold text-white">5%</span>
            </div>
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
                className={`w-full h-11 text-sm font-bold transition-all ${
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Trading...
                  </>
                ) : (
                  `${isBuying ? 'Buy' : 'Sell'} ${coin.symbol}`
                )}
              </Button>
            )
          ) : (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-green-400 text-sm mb-1.5">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
