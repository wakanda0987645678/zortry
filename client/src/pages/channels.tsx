
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import CoinCard from "@/components/coin-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Coin } from "@shared/schema";
import {
  Hash,
  TrendingUp,
  Users,
  Search,
  Filter,
  Plus,
} from "lucide-react";

export default function Channels() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extract search parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);

  const { data: coins = [], isLoading } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const categories = [
    { id: "all", name: "All Channels", icon: Hash },
    { id: "trending", name: "Trending", icon: TrendingUp },
    { id: "popular", name: "Popular", icon: Users },
    { id: "new", name: "New", icon: Plus },
  ];

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <section className="p-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Channels</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Discover and explore different content channels transformed into tradeable digital assets.
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/20 border-border"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-black font-bold"
                      : "bg-muted/20 text-muted-foreground hover:text-white hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Channels Grid */}
      <section className="p-8">
        <div className="max-w-6xl mx-auto">
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
          ) : filteredCoins.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm ? "No channels found" : "No channels yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? `No channels match "${searchTerm}". Try a different search term.`
                  : "Be the first to create a channel from your favorite content!"
                }
              </p>
              {!searchTerm && (
                <Button className="spotify-button">Create First Channel</Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {searchTerm ? `Search results for "${searchTerm}"` : "All Channels"}
                  <span className="text-muted-foreground ml-2">({filteredCoins.length})</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCoins.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
