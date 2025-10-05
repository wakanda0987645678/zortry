
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Coin } from "@shared/schema";
import { User, Users, DollarSign, Coins as CoinsIcon, Copy, Check } from "lucide-react";
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
  const [copiedAddress, setCopiedAddress] = useState(false);
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
    size: 128,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(creatorAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 p-0 overflow-hidden sm:rounded-3xl">
        <div className="relative">
          {/* Header Background */}
          <div className="h-24 bg-gradient-to-br from-primary/40 to-primary/60"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-background"
              />
            </div>

            {/* Username & Address */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {formatAddress(creatorAddress)}
              </h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <span className="font-mono">{creatorAddress}</span>
                {copiedAddress ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Follow Button */}
            <Button
              onClick={handleFollowToggle}
              className={`w-full mb-6 rounded-full font-semibold ${
                isFollowing
                  ? 'bg-muted/20 text-white hover:bg-muted/30'
                  : 'bg-primary text-black hover:bg-primary/90'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-center mb-1">
                  <CoinsIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xl font-bold text-white">{creatorCoins.length}</div>
                <div className="text-xs text-muted-foreground">Coins</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xl font-bold text-white">
                  ${totalMarketCap.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Market Cap</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/10">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold text-white">{totalHolders}</div>
                <div className="text-xs text-muted-foreground">Holders</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
