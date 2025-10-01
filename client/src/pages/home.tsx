
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Coin } from "@shared/schema";
import URLInputForm from "@/components/url-input-form";
import ContentPreviewCard from "@/components/content-preview-card";
import CoinCard from "@/components/coin-card";
import Layout from "@/components/layout";
import {
  TrendingUp,
  Users,
  DollarSign,
  Coins as CoinsIcon,
} from "lucide-react";

export default function Home() {
  const [showPreview, setShowPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);

  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const handleScrapedData = (data: any) => {
    setScrapedData(data);
    setShowPreview(true);
  };

  const handleCoinCreated = () => {
    setShowPreview(false);
    setScrapedData(null);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative p-8 bg-gradient-to-b from-primary/20 via-background/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-xl text-muted-foreground max-w-2xl">
              Import content from any URL and mint it as a tradeable coin on the Base blockchain.
            </p>
          </div>

          <URLInputForm onScraped={handleScrapedData} />
        </div>
      </section>

            {/* Content Preview Section */}
            {showPreview && scrapedData && (
              <section className="p-8">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold mb-6 text-white">Preview & Create Coin</h2>
                  <ContentPreviewCard 
                    scrapedData={scrapedData} 
                    onCoinCreated={handleCoinCreated}
                  />
                </div>
              </section>
            )}

            {/* Stats Section */}
            <section className="p-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-white">Platform Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat-card rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground font-semibold">Total Coins</span>
                      <CoinsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-black text-white" data-testid="text-total-coins">{coins.length}</div>
                    <div className="text-sm text-primary mt-1">All time</div>
                  </div>

                  <div className="stat-card rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground font-semibold">Network</span>
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-black text-white" data-testid="text-total-volume">Base</div>
                    <div className="text-sm text-primary mt-1">Blockchain</div>
                  </div>

                  <div className="stat-card rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground font-semibold">Traders</span>
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-black text-white" data-testid="text-active-traders">Live</div>
                    <div className="text-sm text-primary mt-1">On-chain</div>
                  </div>

                  <div className="stat-card rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground font-semibold">Status</span>
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-black text-white" data-testid="text-blockchain">Active</div>
                    <div className="text-sm text-primary mt-1">Network</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Trending Coins Section */}
            <section className="p-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Trending Coins</h2>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="spotify-card rounded-xl overflow-hidden shimmer">
                        <div className="h-48 bg-muted/20"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-6 bg-muted/20 rounded w-3/4"></div>
                          <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                          <div className="h-16 bg-muted/20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : coins.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CoinsIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No coins yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create a coin from your favorite blog!</p>
                    <Link href="/create">
                      <button className="spotify-button">Create First Coin</button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
