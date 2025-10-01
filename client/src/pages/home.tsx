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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 6v12M9 9h6M9 15h6"/>
                </svg>
                <span className="text-2xl font-bold gradient-text">CoinIT</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-dashboard">
                Dashboard
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-my-coins">
                My Coins
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">
                Docs
              </button>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 opacity-50"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'}}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform <span className="gradient-text">Any Blog</span> into a <span className="gradient-text">Blockchain Coin</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Import content from any URL and mint it as a tradeable coin on the Zora network. Own your favorite content on-chain.
            </p>

            <URLInputForm onScraped={handleScrapedData} />
          </div>
        </div>
      </section>

      {/* Content Preview Section */}
      {showPreview && scrapedData && (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Preview & Create Coin</h2>
              <ContentPreviewCard 
                scrapedData={scrapedData} 
                onCoinCreated={handleCoinCreated}
              />
            </div>
          </div>
        </section>
      )}

      {/* Stats Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card rounded-xl p-4 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Coins</span>
                <CoinsIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-total-coins">{coins.length}</div>
              <div className="text-xs text-green-400 mt-1">All time</div>
            </div>

            <div className="stat-card rounded-xl p-4 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Volume</span>
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-total-volume">Live on chain</div>
              <div className="text-xs text-green-400 mt-1">Real-time</div>
            </div>

            <div className="stat-card rounded-xl p-4 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Traders</span>
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-active-traders">On Zora</div>
              <div className="text-xs text-green-400 mt-1">Network wide</div>
            </div>

            <div className="stat-card rounded-xl p-4 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Blockchain</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-blockchain">Zora</div>
              <div className="text-xs text-green-400 mt-1">Live network</div>
            </div>
          </div>
        </div>
      </section>

      {/* Coin Dashboard */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Coins</h2>
              <p className="text-muted-foreground">Discover the most popular blog coins on the network</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors" data-testid="button-all-coins">
                All Coins
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors" data-testid="button-my-coins">
                My Coins
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl overflow-hidden shimmer">
                  <div className="h-40 bg-muted/50"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-muted/50 rounded w-3/4"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                    <div className="h-16 bg-muted/50 rounded"></div>
                    <div className="h-10 bg-muted/50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : coins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No coins created yet. Be the first to create one!</p>
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

      {/* How It Works */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">How CoinIT Works</h2>
            <p className="text-lg text-muted-foreground">
              Transform any blog post into a tradeable blockchain coin in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Import Content</h3>
              <p className="text-muted-foreground">
                Paste any blog URL and our scraper automatically extracts the title, content, images, and metadata
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Create Coin</h3>
              <p className="text-muted-foreground">
                Review the content preview, customize your coin symbol, and mint it on the Zora blockchain with IPFS storage
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Trade & Earn</h3>
              <p className="text-muted-foreground">
                Your coin is now live! Trade it, track its performance, and earn rewards as the creator
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 6v12M9 9h6M9 15h6"/>
                </svg>
                <span className="text-xl font-bold gradient-text">CoinIT</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform blogs into blockchain coins on the Zora network
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 CoinIT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
