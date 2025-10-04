import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Creator, Coin } from "@shared/schema";
import {
  Users,
  TrendingUp,
  Award,
  Star,
  ExternalLink,
  Coins as CoinsIcon,
} from "lucide-react";
import Layout from "@/components/layout";
import { formatEther } from "viem";
import { useLocation } from "wouter";

export default function Creators() {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<"top" | "rising" | "new">(
    "top",
  );

  const { data: creators = [], isLoading: creatorsLoading } = useQuery<
    Creator[]
  >({
    queryKey: ["/api/creators"],
  });

  const { data: coins = [], isLoading: coinsLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  // Calculate creator stats from real data
  const enrichedCreators = creators.map((creator) => {
    const creatorCoins = coins.filter(
      (coin) => coin.creator.toLowerCase() === creator.address.toLowerCase(),
    );

    return {
      ...creator,
      totalCoins: creatorCoins.length,
      // Calculate total volume from coin creation (mock for now as we don't track actual trading volume)
      totalVolume: (creatorCoins.length * 0.001).toFixed(3), // Estimate based on coin count
      // Generate avatar initials from address
      avatar: creator.name
        ? creator.name.substring(0, 2).toUpperCase()
        : creator.address.substring(2, 4).toUpperCase(),
      // Mock followers based on coin count and address
      followers: Math.floor(
        creatorCoins.length * 50 + parseInt(creator.address.slice(-2), 16) * 10,
      ),
      verified: creatorCoins.length >= 3, // Auto-verify creators with 3+ coins
    };
  });

  // Filter creators based on selected tab
  const filteredCreators = enrichedCreators
    .filter((creator) => creator.totalCoins > 0) // Only show creators with coins
    .sort((a, b) => {
      switch (selectedTab) {
        case "top":
          return b.totalCoins - a.totalCoins;
        case "rising":
          // Sort by recent activity (coins created in last 7 days)
          const recentCoinsA = coins.filter(
            (coin) =>
              coin.creator.toLowerCase() === a.address.toLowerCase() &&
              new Date(coin.createdAt).getTime() >
                Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).length;
          const recentCoinsB = coins.filter(
            (coin) =>
              coin.creator.toLowerCase() === b.address.toLowerCase() &&
              new Date(coin.createdAt).getTime() >
                Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).length;
          return recentCoinsB - recentCoinsA || b.totalCoins - a.totalCoins;
        case "new":
          // Sort by creation date (newest first)
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return b.totalCoins - a.totalCoins;
      }
    });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAge = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diff = now.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "today";
    if (days < 30) return days + "d";
    if (days < 365) return Math.floor(days / 30) + "m";
    return Math.floor(days / 365) + "y";
  };

  const isLoading = creatorsLoading || coinsLoading;

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black mb-4 text-white">
                  Top <span className="spotify-green">Creators</span>
                </h1>
                <p className="text-l text-muted-foreground">
                  Discover the most successful content creators on CoinIT.
                </p>
              </div>

              {/* Inline Stats */}
              <div className="flex flex-wrap gap-6 text-right">
                <div className="text-center lg:text-right">
                  <div className="text-1xl font-black text-white">
                    {filteredCreators.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Creators
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-1xl font-black text-white">
                    {filteredCreators
                      .reduce(
                        (acc, creator) => acc + parseFloat(creator.totalVolume),
                        0,
                      )
                      .toFixed(3)}{" "}
                    ETH
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Volume
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-1xl font-black text-white">
                    {filteredCreators.length > 0
                      ? Math.round(
                          filteredCreators.reduce(
                            (acc, creator) => acc + creator.totalCoins,
                            0,
                          ) / filteredCreators.length,
                        )
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. Coins
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setSelectedTab("top")}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedTab === "top"
                  ? "bg-primary text-black"
                  : "bg-muted/20 text-muted-foreground hover:text-white"
              }`}
            >
              Top Creators
            </button>
            <button
              onClick={() => setSelectedTab("rising")}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedTab === "rising"
                  ? "bg-primary text-black"
                  : "bg-muted/20 text-muted-foreground hover:text-white"
              }`}
            >
              Rising Stars
            </button>
            <button
              onClick={() => setSelectedTab("new")}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedTab === "new"
                  ? "bg-primary text-black"
                  : "bg-muted/20 text-muted-foreground hover:text-white"
              }`}
            >
              New Creators
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="spotify-card rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted/20 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-5 bg-muted/20 rounded w-32 sm:w-40 animate-pulse"></div>
                      <div className="h-4 bg-muted/20 rounded w-24 sm:w-32 animate-pulse"></div>
                    </div>
                    <div className="text-right space-y-2 flex-shrink-0">
                      <div className="h-5 bg-muted/20 rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-muted/20 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No creators yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to create a coin and become a creator!
              </p>
            </div>
          ) : (
            /* Creators List */
            <div className="space-y-4">
              {filteredCreators.map((creator, index) => {
                const coinsCreated = creator.totalCoins; // Assuming totalCoins is the relevant metric
                const totalMarketCap = creator.totalVolume; // Assuming totalVolume is the relevant metric

                return (
                  <div
                    key={creator.id}
                    className="spotify-card flex items-center gap-3 p-3 sm:p-4 cursor-pointer group"
                    onClick={() => navigate(`/creator/${creator.address}`)} // Example navigation
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white">
                        {creator.avatar}
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-black">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm sm:text-base truncate flex items-center gap-1">
                        {creator.name || formatAddress(creator.address)}
                        {index === 0 && (
                          <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </h3>
                      <p className="text-muted-foreground text-xs font-mono hidden sm:block">
                        {formatAddress(creator.address)}
                      </p>
                      <p className="text-muted-foreground text-xs sm:hidden">
                        {coinsCreated} coins
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold text-sm sm:text-base">
                        {totalMarketCap} ETH
                      </div>
                      <div className="text-muted-foreground text-xs hidden sm:block">
                        Total Volume
                      </div>
                      <div className="text-muted-foreground text-xs sm:hidden">
                        {coinsCreated} coins
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
