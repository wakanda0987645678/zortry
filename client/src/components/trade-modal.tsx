
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
import { Loader2, CheckCircle2, ExternalLink, TrendingUp, Coins, User } from "lucide-react";

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
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

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
    setEthAmount("0.000111");
    onOpenChange(false);
  };

  const setQuickAmount = (amount: string) => {
    setEthAmount(amount);
  };

  const GATEWAY_URL = import.meta.env.VITE_NEXT_PUBLIC_GATEWAY_URL || "yellow-patient-cheetah-559.mypinata.cloud";
  
  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("ipfs://")) {
      const hash = imageUrl.replace("ipfs://", "");
      return `https://${GATEWAY_URL}/ipfs/${hash}`;
    }
    return imageUrl;
  };

  const coinImage = coin.metadata?.image ? getImageSrc(coin.metadata.image) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-sm border-border/50 p-0 overflow-hidden">
        <div className="flex">
          {/* Left side - Coin Image */}
          <div className="w-1/2 bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center p-6">
            {coinImage ? (
              <img
                src={coinImage}
                alt={coin.name}
                className="w-full h-full object-contain max-h-96"
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
                <p className="text-sm font-bold text-green-500">▲ $757.53</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24H Volume</p>
                <p className="text-sm font-semibold text-white">$2.30</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Creator Earnings</p>
                <p className="text-sm font-semibold text-white">$0.02</p>
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
                    ? 'bg-muted hover:bg-muted/80 text-white border border-border/30' 
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
              {['0.001 ETH', '0.01 ETH', '0.1 ETH', 'Max'].map((label, idx) => {
                const amount = ['0.001', '0.01', '0.1', '1'][idx];
                return (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickAmount(amount)}
                    disabled={isTrading || !!txHash}
                    className="h-9 text-xs bg-muted/20 hover:bg-muted/40 border-border/30 text-white"
                  >
                    {label}
                  </Button>
                );
              })}
            </div>

            {/* Comment Input */}
            <div className="mb-4">
              <Input
                placeholder="Add a comment..."
                className="h-10 bg-muted/20 border-border/30 text-white placeholder:text-muted-foreground"
                disabled={isTrading || !!txHash}
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
                      : 'bg-muted hover:bg-muted/80'
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
                    `${isBuying ? 'Buy' : 'Sell'}`
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
              Balance: 0 ETH
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
