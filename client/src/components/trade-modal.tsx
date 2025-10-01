import { useState } from "react";
import type { Coin } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, ArrowUpDown, Loader2, CheckCircle2, ExternalLink } from "lucide-react";

interface TradeModalProps {
  coin: Coin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradeModal({ coin, open, onOpenChange }: TradeModalProps) {
  const { toast } = useToast();
  const [ethAmount, setEthAmount] = useState("0.001");
  const [isTrading, setIsTrading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const estimatedTokens = parseFloat(ethAmount) * 1000000; // Mock rate

  const handleTrade = async () => {
    setIsTrading(true);
    
    try {
      const { tradeZoraCoin } = await import("@/lib/zora");
      // This would need wallet integration - placeholder for now
      // const result = await tradeZoraCoin({ ... });
      
      // For now, simulate until wallet integration is complete
      setTimeout(() => {
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        setTxHash(mockTxHash);
        setIsTrading(false);
        
        toast({
          title: "Trade successful!",
          description: `You received ${estimatedTokens.toLocaleString()} ${coin.symbol} tokens`,
        });
      }, 2000);
    } catch (error) {
      console.error("Trade failed:", error);
      setIsTrading(false);
      toast({
        title: "Trade failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTxHash(null);
    setEthAmount("0.001");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trade {coin.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coin Info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Trading</span>
              <span className="text-sm font-medium" data-testid="text-modal-coin-name">{coin.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Symbol</span>
              <span className="text-sm font-medium font-mono" data-testid="text-modal-coin-symbol">${coin.symbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm font-medium font-mono" data-testid="text-modal-coin-address">{formatAddress(coin.address)}</span>
            </div>
          </div>

          {/* Trade Input */}
          <div>
            <Label htmlFor="ethAmount" className="text-sm font-medium mb-2 block">
              You Pay
            </Label>
            <div className="relative">
              <Input
                id="ethAmount"
                type="number"
                step="0.0001"
                min="0"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="pr-16 bg-muted border-input text-foreground text-lg font-medium"
                disabled={isTrading || !!txHash}
                data-testid="input-eth-amount"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-sm font-medium text-muted-foreground">ETH</span>
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-primary/20">
              <ArrowUpDown className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Trade Output */}
          <div>
            <Label htmlFor="tokenAmount" className="text-sm font-medium mb-2 block">
              You Receive (Estimated)
            </Label>
            <div className="relative">
              <Input
                id="tokenAmount"
                type="text"
                value={estimatedTokens.toLocaleString()}
                readOnly
                className="pr-24 bg-muted border-input text-foreground text-lg font-medium"
                data-testid="text-token-amount"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-sm font-medium text-muted-foreground">${coin.symbol}</span>
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="font-medium">1 ETH = 1,000,000 ${coin.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage Tolerance</span>
              <span className="font-medium">5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium">Base</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!txHash ? (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isTrading}
                data-testid="button-cancel-trade"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow"
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
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirm Trade
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-400 mb-1">Transaction Successful!</div>
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
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
