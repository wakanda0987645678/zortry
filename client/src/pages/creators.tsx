
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Coin } from "@shared/schema";
import { Users, TrendingUp, Award, Star } from "lucide-react";

export default function Creators() {
  const [selectedTab, setSelectedTab] = useState<"top" | "rising" | "new">("top");

  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  // Mock creator data - in a real app this would come from your API
  const creators = [
    {
      id: 1,
      name: "TechBlogger",
      totalCoins: 15,
      totalVolume: "2.5 ETH",
      followers: 1200,
      avatar: "TB",
      verified: true,
    },
    {
      id: 2,
      name: "CryptoWriter",
      totalCoins: 8,
      totalVolume: "1.8 ETH",
      followers: 850,
      avatar: "CW",
      verified: true,
    },
    {
      id: 3,
      name: "NewsDigest",
      totalCoins: 22,
      totalVolume: "3.2 ETH",
      followers: 2100,
      avatar: "ND",
      verified: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-4 text-white">
            Top <span className="spotify-green">Creators</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover the most successful content creators on CoinIT.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground font-semibold">Active Creators</span>
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-black text-white">{creators.length}</div>
            <div className="text-sm text-primary mt-1">This month</div>
          </div>

          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground font-semibold">Total Volume</span>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-black text-white">7.5 ETH</div>
            <div className="text-sm text-primary mt-1">All time</div>
          </div>

          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground font-semibold">Avg. Coins</span>
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-black text-white">15</div>
            <div className="text-sm text-primary mt-1">Per creator</div>
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

        {/* Creators List */}
        <div className="space-y-4">
          {creators.map((creator, index) => (
            <div key={creator.id} className="spotify-card rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                    {creator.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{creator.name}</h3>
                      {creator.verified && (
                        <Star className="w-4 h-4 text-primary fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {creator.followers.toLocaleString()} followers
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-lg font-bold text-white">{creator.totalVolume}</div>
                  <div className="text-sm text-muted-foreground">
                    {creator.totalCoins} coins created
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
