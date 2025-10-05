import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Coin } from "@shared/schema";
import Layout from "@/components/layout";
import CoinCard from "@/components/coin-card";
import { 
  User as UserIcon, 
  Share2, 
  ChevronDown, 
  Grid3x3, 
  List,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Edit2,
  Users,
  Coins as CoinsIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProfileCoins, getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [selectedTab, setSelectedTab] = useState<"created" | "owned">("created");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalMarketCap, setTotalMarketCap] = useState<number>(0);
  const [totalHolders, setTotalHolders] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const { toast } = useToast();

  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const createdCoins = useMemo(() => {
    if (!address) return [];
    return coins.filter(coin => 
      coin.creator.toLowerCase() === address.toLowerCase()
    );
  }, [coins, address]);

  const ownedCoins = useMemo(() => {
    return [];
  }, []);

  const displayedCoins = selectedTab === "created" ? createdCoins : ownedCoins;

  useEffect(() => {
    if (!address || !isConnected) {
      setTotalEarnings(0);
      setTotalMarketCap(0);
      setTotalHolders(0);
      return;
    }

    let isMounted = true;
    setIsLoadingStats(true);

    async function fetchAllStats() {
      try {
        const response = await getProfileCoins({
          identifier: address,
          count: 100,
        });

        const profile: any = response.data?.profile;
        let earnings = 0;
        let marketCap = 0;
        let holders = 0;

        if (profile?.createdCoins?.edges) {
          for (const edge of profile.createdCoins.edges) {
            const coin: any = edge.node;
            
            // Get earnings
            if (coin?.creatorEarnings && coin.creatorEarnings.length > 0) {
              earnings += parseFloat(coin.creatorEarnings[0].amountUsd || "0");
            }

            // Get market cap and holders from individual coin data
            if (coin?.address) {
              try {
                const coinData = await getCoin({
                  address: coin.address,
                  chain: base.id,
                });

                const tokenData = coinData.data?.zora20Token;
                if (tokenData?.marketCap) {
                  marketCap += parseFloat(tokenData.marketCap);
                }
                if (tokenData?.uniqueHolders) {
                  holders += tokenData.uniqueHolders;
                }
              } catch (err) {
                console.error(`Error fetching coin stats for ${coin.address}:`, err);
              }
            }
          }
        }

        if (isMounted) {
          setTotalEarnings(earnings);
          setTotalMarketCap(marketCap);
          setTotalHolders(holders);
          setIsLoadingStats(false);
        }
      } catch (error) {
        console.error("Error fetching creator stats:", error);
        if (isMounted) {
          setTotalEarnings(0);
          setTotalMarketCap(0);
          setTotalHolders(0);
          setIsLoadingStats(false);
        }
      }
    }

    fetchAllStats();

    return () => {
      isMounted = false;
    };
  }, [address, isConnected]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!address) return;
    const url = `${window.location.origin}/profile`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My CoinIT Profile',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Profile link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your profile
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <img
              src={createAvatar(avataaars, {
                seed: address || 'anonymous',
                size: 128,
              }).toDataUri()}
              alt="Profile Avatar"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-border shadow-lg"
            />
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors shadow-lg"
              data-testid="button-edit-profile"
            >
              <Edit2 className="w-4 h-4 text-black" />
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {username || (address ? formatAddress(address) : 'Anonymous')}
          </h1>

          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 hover:bg-muted/30 rounded-full text-xs text-muted-foreground transition-colors mb-3"
            data-testid="button-copy-address"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </>
            )}
          </button>

          {bio && (
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              {bio}
            </p>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-muted/20 hover:bg-muted/30 rounded-full text-sm transition-colors"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span className="text-white">Share</span>
            </button>
          </div>

          {/* Stats Grid */}
          {createdCoins.length > 0 && (
            <div className="w-full grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CoinsIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {createdCoins.length}
                </div>
                <div className="text-xs text-muted-foreground">Coins</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${isLoadingStats ? '0' : totalMarketCap > 1000 ? `${(totalMarketCap / 1000).toFixed(1)}k` : totalMarketCap.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Market Cap</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-4 border border-orange-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {isLoadingStats ? '0' : totalHolders}
                </div>
                <div className="text-xs text-muted-foreground">Holders</div>
              </div>
            </div>
          )}

          {/* Earnings Card */}
          {createdCoins.length > 0 && totalEarnings > 0 && (
            <div className="w-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 mb-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Total Earnings</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Live</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${isLoadingStats ? '0.00' : totalEarnings.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">USDT</div>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  toast({
                    title: "Profile updated",
                    description: "Your profile has been updated successfully",
                  });
                }}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("created")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedTab === "created"
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
              data-testid="button-tab-created"
            >
              Created <sup className="text-xs">{createdCoins.length}</sup>
            </button>
            <button
              onClick={() => setSelectedTab("owned")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedTab === "owned"
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
              data-testid="button-tab-owned"
            >
              Owned <sup className="text-xs">{ownedCoins.length}</sup>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-muted/30 text-white"
                  : "text-muted-foreground hover:bg-muted/20"
              }`}
              data-testid="button-view-list"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-muted/30 text-white"
                  : "text-muted-foreground hover:bg-muted/20"
              }`}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="spotify-card rounded-xl overflow-hidden p-3 space-y-3">
                <div className="aspect-square w-full bg-muted/20 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-muted/20 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted/20 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted/20 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-muted/20 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedCoins.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {selectedTab === "created" ? "No coins created yet" : "No coins owned yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedTab === "created" 
                ? "Create your first coin to get started" 
                : "Start collecting coins to build your portfolio"}
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {displayedCoins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} isOwnCoin={selectedTab === "created"} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
