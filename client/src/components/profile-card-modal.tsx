
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Coin } from "@shared/schema";
import { Users, DollarSign, Coins as CoinsIcon, TrendingUp } from "lucide-react";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

interface ProfileCardModalProps {
  creatorAddress: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileCardModal({ creatorAddress, open, onOpenChange }: ProfileCardModalProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [totalMarketCap, setTotalMarketCap] = useState<number>(0);
  const [totalHolders, setTotalHolders] = useState<number>(0);

  const { data: coins = [] } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const creatorCoins = coins.filter(
    (coin) => coin.creator.toLowerCase() === creatorAddress.toLowerCase()
  );

  const avatarUrl = createAvatar(avataaars, {
    seed: creatorAddress,
    size: 96,
  }).toDataUri();

  useEffect(() => {
    const fetchStats = async () => {
      let marketCapSum = 0;
      let holdersSum = 0;

      for (const coin of creatorCoins) {
        if (coin.address) {
          try {
            const response = await getCoin({
              address: coin.address,
              chain: base.id,
            });

            const coinData = response.data?.zora20Token;
            if (coinData?.marketCap) {
              marketCapSum += parseFloat(coinData.marketCap);
            }
            if (coinData?.uniqueHolders !== undefined) {
              holdersSum += coinData.uniqueHolders;
            }
          } catch (error) {
            console.error(`Error fetching stats for ${coin.symbol}:`, error);
          }
        }
      }

      setTotalMarketCap(marketCapSum);
      setTotalHolders(holdersSum);
    };

    if (open && creatorCoins.length > 0) {
      fetchStats();
    }
  }, [open, creatorCoins]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  // Get the first coin's image for background or use a gradient
  const backgroundImage = creatorCoins[0]?.metadata?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px] bg-card border-border/50 p-0 overflow-hidden sm:rounded-3xl">
        <div className="relative">
          {/* Header Background with gradient overlay */}
          <div className="relative h-32 overflow-hidden">
            {backgroundImage ? (
              <>
                <img 
                  src={backgroundImage} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/40 via-primary/30 to-primary/20"></div>
            )}
            
            {/* Badge */}
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
              <CoinsIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Creator</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-5 pb-5 -mt-10">
            {/* Avatar */}
            <div className="relative mb-3">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-background shadow-lg"
              />
            </div>

            {/* Name & Address */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-foreground mb-0.5">
                {formatAddress(creatorAddress)}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {creatorAddress}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium text-muted-foreground">Rating</span>
                </div>
                <p className="text-base font-bold text-foreground">5.0</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-muted-foreground">Market</span>
                </div>
                <p className="text-base font-bold text-foreground">
                  ${totalMarketCap > 1000 ? `${(totalMarketCap / 1000).toFixed(0)}k` : totalMarketCap.toFixed(0)}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground">Holders</span>
                </div>
                <p className="text-base font-bold text-foreground">{totalHolders}</p>
              </div>
            </div>

            {/* Follow Button */}
            <Button
              onClick={handleFollowToggle}
              className={`w-full rounded-full font-semibold transition-all ${
                isFollowing
                  ? 'bg-muted/50 text-foreground hover:bg-muted/70 border border-border'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isFollowing ? 'Following' : 'Get in Touch'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
