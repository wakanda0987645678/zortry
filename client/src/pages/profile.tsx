import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Coin } from "@shared/schema";
import Layout from "@/components/layout";
import CoinCard from "@/components/coin-card";
import {
  User as UserIcon,
  Share2,
  Grid3x3,
  List,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Edit2,
  Users,
  Coins as CoinsIcon,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCoin } from "@zoralabs/coins-sdk";
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
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

  const displayedCoins = selectedTab === "created" 
    ? createdCoins.filter(coin => coin.address !== null) as Array<typeof createdCoins[0] & { address: string }>
    : ownedCoins;

  useEffect(() => {
    if (!address || !isConnected || !createdCoins.length) {
      setTotalEarnings(0);
      setTotalMarketCap(0);
      setTotalHolders(0);
      setIsLoadingStats(false);
      return;
    }

    let isMounted = true;
    setIsLoadingStats(true);

    async function fetchAllStats() {
      try {
        let earnings = 0;
        let marketCap = 0;
        let holders = 0;

        for (const coin of createdCoins) {
          if (coin.address && coin.status === 'active') {
            try {
              const coinData = await getCoin({
                address: coin.address,
                chain: base.id,
              });

              const tokenData = coinData.data?.zora20Token;
              
              if (tokenData?.creatorEarnings && tokenData.creatorEarnings.length > 0) {
                const earningAmount = parseFloat(String(tokenData.creatorEarnings[0].amountUsd || tokenData.creatorEarnings[0].amount?.amountDecimal || "0"));
                earnings += earningAmount;
              }
              
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
  }, [address, isConnected, createdCoins]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSaveProfile = () => {
    // Placeholder for actual profile save logic
    // This would involve uploading the image (if changed) and updating username/bio
    setIsEditModalOpen(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    // Reset image state after saving
    setProfileImage(null);
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
        {/* Header Section */}
        <div className="relative mb-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <button className="text-muted-foreground hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-muted/30 hover:bg-muted/40 rounded-full text-sm font-semibold text-white transition-colors flex items-center gap-2"
                data-testid="button-edit-profile"
              >
                <Edit2 className="w-4 h-4" />
                EDIT
              </button>
            </div>
          </div>

          {/* Avatar and Info */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <img
                src={profileImage ? URL.createObjectURL(profileImage) : createAvatar(avataaars, {
                  seed: address || 'anonymous',
                  size: 128,
                }).toDataUri()}
                alt="Profile Avatar"
                className="w-28 h-28 rounded-3xl border-4 border-border shadow-xl"
              />
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              {username || (address ? formatAddress(address) : 'Anonymous')}
            </h1>

            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4"
              data-testid="button-copy-address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <span>@{address ? `${address.slice(2, 8)}` : ''}</span>
                  <Copy className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {bio && (
              <p className="text-muted-foreground text-sm mb-4 max-w-md px-4">
                {bio}
              </p>
            )}
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                {isLoadingStats ? '-' : createdCoins.length}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Coins</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                {isLoadingStats ? '-' : totalMarketCap >= 1000000
                  ? `$${(totalMarketCap / 1000000).toFixed(2)}M`
                  : totalMarketCap >= 1000
                    ? `$${(totalMarketCap / 1000).toFixed(1)}k`
                    : `$${totalMarketCap.toFixed(2)}`}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Market Cap</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                {isLoadingStats ? '-' : totalHolders}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Holders</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-green-500 mb-1">
                {isLoadingStats ? '-' : totalEarnings >= 1000
                  ? `$${(totalEarnings / 1000).toFixed(1)}k`
                  : `$${totalEarnings.toFixed(2)}`}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Earnings</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
              <UserIcon className="w-4 h-4" />
              Following
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 bg-primary/20 text-primary font-semibold rounded-full hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Earnings Card - Compact */}
          {createdCoins.length > 0 && totalEarnings > 0 && (
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 mb-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Total Earnings</div>
                    <div className="text-xl font-bold text-white">
                      ${isLoadingStats ? '0.00' : totalEarnings.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Live</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[400px] bg-card border-border rounded-3xl p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-foreground text-xl font-bold">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <label htmlFor="profile-image-upload" className="cursor-pointer group relative">
                  <img
                    src={profileImage ? URL.createObjectURL(profileImage) : createAvatar(avataaars, {
                      seed: address || 'anonymous',
                      size: 96,
                    }).toDataUri()}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full border-4 border-primary shadow-lg transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full px-3 py-1 text-xs text-white">
                      Change
                    </div>
                  </div>
                </label>
                <Input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-muted/20 border-border text-foreground rounded-xl h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="bg-muted/20 border-border text-foreground resize-none rounded-xl"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold rounded-xl h-11"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tabs & View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-muted/20 rounded-full p-1">
            <button
              onClick={() => setSelectedTab("created")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedTab === "created"
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="button-tab-created"
            >
              Created {createdCoins.length > 0 && <span className="ml-1">({createdCoins.length})</span>}
            </button>
            <button
              onClick={() => setSelectedTab("owned")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedTab === "owned"
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="button-tab-owned"
            >
              Owned {ownedCoins.length > 0 && <span className="ml-1">({ownedCoins.length})</span>}
            </button>
          </div>

          <div className="flex gap-1 bg-muted/20 rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Coins Display */}
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
              <CoinsIcon className="w-8 h-8 text-muted-foreground" />
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
              <CoinCard 
                key={coin.id} 
                coin={{
                  ...coin,
                  createdAt: typeof coin.createdAt === 'string' ? coin.createdAt : coin.createdAt.toISOString(),
                  ipfsUri: coin.ipfsUri ?? undefined
                }} 
                isOwnCoin={selectedTab === "created"} 
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}