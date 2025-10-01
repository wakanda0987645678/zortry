import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Coin } from "@shared/schema";
import CoinCard from "@/components/coin-card";
import Layout from "@/components/layout";
import {
  TrendingUp,
  Users,
  DollarSign,
  Coins as CoinsIcon,
} from "lucide-react";

export default function Home() {
  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  return (
    <Layout>
      {/* Stats Section */}
            <section className="p-4 sm:p-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">Platform Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat-card rounded-xl p-4 sm:p-6 hover-lift">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-muted-foreground font-semibold text-sm sm:text-base">Total Coins</span>
                      <CoinsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white" data-testid="text-total-coins">{coins.length}</div>
                    <div className="text-xs sm:text-sm text-primary mt-1">All time</div>
                  </div>

                  <div className="stat-card rounded-xl p-4 sm:p-6 hover-lift">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-muted-foreground font-semibold text-sm sm:text-base">Network</span>
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white" data-testid="text-total-volume">Base</div>
                    <div className="text-xs sm:text-sm text-primary mt-1">Blockchain</div>
                  </div>

                  <div className="stat-card rounded-xl p-4 sm:p-6 hover-lift">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-muted-foreground font-semibold text-sm sm:text-base">Traders</span>
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white" data-testid="text-active-traders">Live</div>
                    <div className="text-xs sm:text-sm text-primary mt-1">On-chain</div>
                  </div>

                  <div className="stat-card rounded-xl p-4 sm:p-6 hover-lift">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-muted-foreground font-semibold text-sm sm:text-base">Status</span>
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white" data-testid="text-blockchain">Active</div>
                    <div className="text-xs sm:text-sm text-primary mt-1">Network</div>
                  </div>
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