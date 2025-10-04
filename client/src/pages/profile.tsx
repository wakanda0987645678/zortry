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
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProfileCoins } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [selectedTab, setSelectedTab] = useState<"created" | "owned">("created");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
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
      return;
    }

    let isMounted = true;
    setIsLoadingEarnings(true);

    async function fetchAllEarnings() {
      try {
        const response = await getProfileCoins({
          identifier: address,
          count: 100,
        });

        const profile: any = response.data?.profile;
        let total = 0;

        if (profile?.createdCoins?.edges) {
          for (const edge of profile.createdCoins.edges) {
            const coin: any = edge.node;
            
            if (coin?.creatorEarnings && coin.creatorEarnings.length > 0) {
              const earnings = parseFloat(coin.creatorEarnings[0].amountUsd || "0");
              total += earnings;
            }
          }
        }

        if (isMounted) {
          setTotalEarnings(total);
          setIsLoadingEarnings(false);
        }
      } catch (error) {
        console.error("Error fetching creator earnings:", error);
        if (isMounted) {
          setTotalEarnings(0);
          setIsLoadingEarnings(false);
        }
      }
    }

    fetchAllEarnings();

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
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/40 to-primary/60 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {address ? formatAddress(address) : 'Anonymous'}
          </h1>

          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 px-4 py-2 bg-muted/20 hover:bg-muted/30 rounded-full text-sm text-muted-foreground transition-colors mb-4"
            data-testid="button-copy-address"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex gap-3 mb-6">
            <button 
              className="spotify-button"
              data-testid="button-follow"
            >
              Follow
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-muted/20 hover:bg-muted/30 rounded-full flex items-center justify-center transition-colors"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>

          <p className="text-muted-foreground text-sm mb-6 max-w-md">
            the world is starting to realize that the future of social will be onchain.
          </p>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-background"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full border-2 border-background"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full border-2 border-background"></div>
            </div>
            <span className="text-sm font-semibold text-white">
              {Math.floor(createdCoins.length * 50 + Math.random() * 100)} followers
            </span>
          </div>

          {createdCoins.length > 0 && (
            <div className="w-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 mb-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">Total Earnings</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>Live</span>
                </div>
              </div>
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  ${totalEarnings.toFixed(2)} USDT
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    From {createdCoins.length} coin{createdCoins.length !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("created")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
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
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
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
              className={`p-2 rounded-lg transition-colors ${
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
              className={`p-2 rounded-lg transition-colors ${
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="spotify-card rounded-xl overflow-hidden shimmer h-48"></div>
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
