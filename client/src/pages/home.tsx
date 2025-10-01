
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Coin } from "@shared/schema";
import URLInputForm from "@/components/url-input-form";
import ContentPreviewCard from "@/components/content-preview-card";
import CoinCard from "@/components/coin-card";
import WalletConnectButton from "@/components/wallet-connect-button";
import {
  TrendingUp,
  Users,
  DollarSign,
  Coins as CoinsIcon,
  Play,
  Search,
  Home,
  Library,
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Spotify-style Layout */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-black/90 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-black fill-current" />
            </div>
            <span className="text-2xl font-bold text-white">CoinIT</span>
          </div>

          <nav className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-white hover:text-white transition-colors cursor-pointer">
              <Home className="w-6 h-6" />
              <span className="font-bold">Home</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors cursor-pointer">
              <Search className="w-6 h-6" />
              <span className="font-bold">Browse</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors cursor-pointer">
              <Library className="w-6 h-6" />
              <span className="font-bold">Your Coins</span>
            </div>
          </nav>

          <div className="bg-muted/20 rounded-lg p-4 mt-auto">
            <h3 className="font-bold text-white mb-2">Create Your First Coin</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Turn any blog post into a tradeable digital asset.
            </p>
            <button className="spotify-button w-full">
              Get Started
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-4">
              <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center opacity-60">
                <span className="text-sm">←</span>
              </button>
              <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center opacity-60">
                <span className="text-sm">→</span>
              </button>
            </div>
            <WalletConnectButton />
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Hero Section */}
            <section className="relative p-8 bg-gradient-to-b from-primary/20 via-background/50 to-background">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-6xl font-black mb-4 text-white">
                    Transform Blogs into <span className="spotify-green">Digital Assets</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    Import content from any URL and mint it as a tradeable coin on the Zora blockchain.
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
                    <div className="text-3xl font-black text-white" data-testid="text-total-volume">Zora</div>
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
                    <button className="spotify-button">Create First Coin</button>
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

            {/* Footer */}
            <footer className="border-t border-border p-8 mt-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-black fill-current" />
                      </div>
                      <span className="text-xl font-bold text-white">CoinIT</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Transform blogs into blockchain coins on Zora
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-border pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    © 2024 CoinIT. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
