
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Coin } from "@shared/schema";
import { Trophy, TrendingUp, DollarSign, Coins as CoinsIcon } from "lucide-react";
import Layout from "@/components/layout";

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d" | "all">("24h");
  const [selectedCategory, setSelectedCategory] = useState<"volume" | "price" | "holders">("volume");

  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  // Mock leaderboard data - in a real app this would come from your API with actual trading data
  const mockLeaderboardData = coins.map((coin, index) => ({
    ...coin,
    volume24h: Math.random() * 10,
    price: Math.random() * 0.1,
    holders: Math.floor(Math.random() * 500) + 10,
    change24h: (Math.random() - 0.5) * 20,
    rank: index + 1,
  }));

  const sortedCoins = [...mockLeaderboardData].sort((a, b) => {
    switch (selectedCategory) {
      case "volume":
        return b.volume24h - a.volume24h;
      case "price":
        return b.price - a.price;
      case "holders":
        return b.holders - a.holders;
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-4 text-white">
            <span className="spotify-green">Leaderboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track the top performing coins and trending content.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            <span className="text-sm font-semibold text-muted-foreground self-center">Period:</span>
            {(["24h", "7d", "30d", "all"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedPeriod === period
                    ? "bg-primary text-black"
                    : "bg-muted/20 text-muted-foreground hover:text-white"
                }`}
              >
                {period === "all" ? "All Time" : period.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-semibold text-muted-foreground self-center">Sort by:</span>
            {(["volume", "price", "holders"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedCategory === category
                    ? "bg-primary text-black"
                    : "bg-muted/20 text-muted-foreground hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {sortedCoins.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="spotify-card rounded-xl p-6 text-center order-1">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🥈</span>
              </div>
              <h3 className="font-bold text-white mb-2 truncate">{sortedCoins[1].title}</h3>
              <div className="text-lg font-bold text-primary">
                {selectedCategory === "volume" && `${sortedCoins[1].volume24h.toFixed(2)} ETH`}
                {selectedCategory === "price" && `${sortedCoins[1].price.toFixed(4)} ETH`}
                {selectedCategory === "holders" && `${sortedCoins[1].holders} holders`}
              </div>
            </div>

            {/* 1st Place */}
            <div className="spotify-card rounded-xl p-6 text-center order-2 border-2 border-primary">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-bold text-white mb-2 truncate">{sortedCoins[0].title}</h3>
              <div className="text-xl font-bold text-primary">
                {selectedCategory === "volume" && `${sortedCoins[0].volume24h.toFixed(2)} ETH`}
                {selectedCategory === "price" && `${sortedCoins[0].price.toFixed(4)} ETH`}
                {selectedCategory === "holders" && `${sortedCoins[0].holders} holders`}
              </div>
            </div>

            {/* 3rd Place */}
            <div className="spotify-card rounded-xl p-6 text-center order-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🥉</span>
              </div>
              <h3 className="font-bold text-white mb-2 truncate">{sortedCoins[2].title}</h3>
              <div className="text-lg font-bold text-primary">
                {selectedCategory === "volume" && `${sortedCoins[2].volume24h.toFixed(2)} ETH`}
                {selectedCategory === "price" && `${sortedCoins[2].price.toFixed(4)} ETH`}
                {selectedCategory === "holders" && `${sortedCoins[2].holders} holders`}
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="spotify-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-white">Full Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/10">
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-semibold">Rank</th>
                  <th className="text-left p-4 text-muted-foreground font-semibold">Coin</th>
                  <th className="text-right p-4 text-muted-foreground font-semibold">Volume (24h)</th>
                  <th className="text-right p-4 text-muted-foreground font-semibold">Price</th>
                  <th className="text-right p-4 text-muted-foreground font-semibold">Change (24h)</th>
                  <th className="text-right p-4 text-muted-foreground font-semibold">Holders</th>
                </tr>
              </thead>
              <tbody>
                {sortedCoins.map((coin, index) => (
                  <tr key={coin.id} className="border-b border-border hover:bg-muted/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-bold">#{index + 1}</span>
                        {index < 3 && <Trophy className="w-4 h-4 text-primary" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <CoinsIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-white truncate max-w-xs">{coin.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{coin.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-white">{coin.volume24h.toFixed(2)} ETH</td>
                    <td className="p-4 text-right font-bold text-white">{coin.price.toFixed(4)} ETH</td>
                    <td className="p-4 text-right">
                      <span className={`font-bold ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-white">{coin.holders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
