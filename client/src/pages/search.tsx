
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Coin, Creator } from "@shared/schema";
import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X, ChevronRight, Coins as CoinsIcon, Users, TrendingUp } from "lucide-react";
import CoinCard from "@/components/coin-card";

type SearchCategory = "top" | "coins" | "creators" | "channels";

export default function Search() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>("top");
  const [isFocused, setIsFocused] = useState(false);

  const { data: coins = [] } = useQuery<Coin[]>({
    queryKey: ["/api/coins"],
  });

  const { data: creators = [] } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  // Filter results based on search query
  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return coins.slice(0, 6);
    const query = searchQuery.toLowerCase();
    return coins.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query) ||
      coin.creator.toLowerCase().includes(query)
    );
  }, [coins, searchQuery]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return creators.slice(0, 6);
    const query = searchQuery.toLowerCase();
    return creators.filter(creator => 
      creator.name?.toLowerCase().includes(query) ||
      creator.address.toLowerCase().includes(query)
    );
  }, [creators, searchQuery]);

  // Featured/Trending coins for "Featuring" section
  const featuredCoins = useMemo(() => {
    return coins.slice(0, 3);
  }, [coins]);

  const categories = [
    { id: "top" as SearchCategory, label: "Top" },
    { id: "coins" as SearchCategory, label: "Coins" },
    { id: "creators" as SearchCategory, label: "Creators" },
    { id: "channels" as SearchCategory, label: "Channels" },
  ];

  const clearSearch = () => {
    setSearchQuery("");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const hasSearchResults = searchQuery.trim().length > 0;
  const showResults = (selectedCategory === "top" || selectedCategory === "coins") && filteredCoins.length > 0;
  const showCreators = (selectedCategory === "top" || selectedCategory === "creators") && filteredCreators.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Search Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            {/* Search Input */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search coins, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-10 pr-24 h-12 bg-muted/20 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/30 transition-all"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors px-2"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Content */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-8">
          {!hasSearchResults ? (
            /* Browse/Featured Content when no search */
            <>
              {/* Top Result Card */}
              {featuredCoins.length > 0 && (
                <div 
                  className="spotify-card flex items-center gap-4 p-4 cursor-pointer group"
                  onClick={() => navigate(`/`)}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <CoinsIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-bold text-lg">Trending Now</h3>
                    <p className="text-muted-foreground text-sm">Coin</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              )}

              {/* Featuring Section */}
              <div className="space-y-4">
                <h2 className="text-foreground font-bold text-xl">Featuring Trending Coins</h2>
                <div className="grid grid-cols-2 gap-4">
                  {featuredCoins.map((coin) => (
                    <div 
                      key={coin.id}
                      className="spotify-card cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/`)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center p-6">
                        <CoinsIcon className="w-16 h-16 text-primary" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-foreground font-bold text-sm truncate">{coin.name}</h3>
                        <p className="text-muted-foreground text-xs">{coin.symbol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browse Coins */}
              <div 
                className="spotify-card flex items-center justify-between p-4 cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold">Explore All Coins</h3>
                    <p className="text-muted-foreground text-sm">Discover trending coins</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>

              {/* Browse Creators */}
              <div 
                className="spotify-card flex items-center justify-between p-4 cursor-pointer group"
                onClick={() => navigate("/creators")}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold">Top Creators</h3>
                    <p className="text-muted-foreground text-sm">Meet the community</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </>
          ) : (
            /* Search Results */
            <>
              {/* Coins Results */}
              {showResults && (
                <div className="space-y-4">
                  <h2 className="text-foreground font-bold text-xl">
                    Coins {filteredCoins.length > 0 && `(${filteredCoins.length})`}
                  </h2>
                  {filteredCoins.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {filteredCoins.slice(0, 6).map((coin) => (
                        <CoinCard key={coin.id} coin={coin} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No coins found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Creators Results */}
              {showCreators && (
                <div className="space-y-4">
                  <h2 className="text-foreground font-bold text-xl">
                    Creators {filteredCreators.length > 0 && `(${filteredCreators.length})`}
                  </h2>
                  {filteredCreators.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCreators.slice(0, 6).map((creator) => (
                        <div 
                          key={creator.id}
                          className="spotify-card flex items-center gap-4 p-4 cursor-pointer group"
                          onClick={() => navigate("/creators")}
                        >
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            {creator.name ? creator.name.substring(0, 2).toUpperCase() : creator.address.substring(2, 4).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-foreground font-bold truncate">
                              {creator.name || formatAddress(creator.address)}
                            </h3>
                            <p className="text-muted-foreground text-sm">Creator</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No creators found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {!showResults && !showCreators && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-foreground font-bold text-xl mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try searching for something else</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
