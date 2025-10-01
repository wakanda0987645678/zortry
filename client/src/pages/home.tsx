import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Coin } from "@shared/schema";
import CoinCard from "@/components/coin-card";
import Layout from "@/components/layout";
import { Coins as CoinsIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "youtube", label: "YouTube" },
    { id: "spotify", label: "Spotify" },
    { id: "medium", label: "Medium" },
    { id: "substack", label: "Substack" },
    { id: "gitcoin", label: "Gitcoin" },
    { id: "giveth", label: "Giveth" },
    { id: "tiktok", label: "TikTok" },
    { id: "instagram", label: "Instagram" },
    { id: "twitter", label: "Twitter" },
    { id: "github", label: "GitHub" },
  ];

  return (
    <Layout>
      {/* Stats Section */}
      <section className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground mb-6">
            <span data-testid="text-total-coins">
              <span className="font-semibold text-white">{coins.length}</span> Total Coins
            </span>
            <span className="text-border">•</span>
            <span data-testid="text-total-volume">
              <span className="font-semibold text-white">Base</span> Network
            </span>
            <span className="text-border">•</span>
            <span data-testid="text-active-traders">
              <span className="font-semibold text-white">Live</span> Traders
            </span>
            <span className="text-border">•</span>
            <span data-testid="text-blockchain">
              <span className="font-semibold text-white">Active</span> Status
            </span>
          </div>

          {/* Category Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary text-black"
                    : "bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-white"
                }`}
                data-testid={`button-category-${category.id}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Coins Section */}
            <section className="p-4 sm:p-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-0">Trending Coins</h2>
                  <div className="flex gap-3">
                    <button className="spotify-secondary-button" data-testid="button-all-coins">
                      All Coins
                    </button>
                    <button className="spotify-button" data-testid="button-my-coins">
                      My Coins
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="spotify-card rounded-xl overflow-hidden shimmer">
                        <div className="h-40 sm:h-48 bg-muted/20"></div>
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                          <div className="h-5 sm:h-6 bg-muted/20 rounded w-3/4"></div>
                          <div className="h-3 sm:h-4 bg-muted/20 rounded w-1/2"></div>
                          <div className="h-12 sm:h-16 bg-muted/20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : coins.length === 0 ? (
                  <div className="text-center py-8 sm:py-16">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <CoinsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No coins yet</h3>
                    <p className="text-muted-foreground mb-4 sm:mb-6 px-4">Be the first to create a coin from your favorite blog!</p>
                    <Link href="/create">
                      <button className="spotify-button">Create First Coin</button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {coins.map((coin) => (
                      <CoinCard key={coin.id} coin={coin} />
                    ))}
                  </div>
                )}
              </div>
            </section>


          </Layout>
  );
}