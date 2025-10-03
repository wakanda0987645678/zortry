import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TradeModal from "@/components/trade-modal";
import CreateCoinModal from "@/components/create-coin-modal";
import {
  Hash,
  TrendingUp,
  Users,
  Search,
  Filter,
  Plus,
  Clock,
  DollarSign,
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  creator: string;
  image: string;
  marketCap: string;
  price: string;
  holders: number;
  timeAgo: string;
  priceChange: number;
  address: string;
  symbol: string;
}

export default function Channels() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Extract search parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);

  // Mock channels data
  const mockChannels: Channel[] = [
    {
      id: "1",
      name: "Meetings",
      creator: "fullmetaldroid",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
      marketCap: "$1k",
      price: "$16.36",
      holders: 3,
      timeAgo: "9m",
      priceChange: 12.5,
      address: "0x1234567890123456789012345678901234567890",
      symbol: "MEET"
    },
    {
      id: "2",
      name: "Titan Fries",
      creator: "rangegouraji",
      image: "https://images.unsplash.com/photo-1630409346775-8765a0bb0bb?w=400&h=300&fit=crop",
      marketCap: "$49.3",
      price: "$0.30",
      holders: 3,
      timeAgo: "13m",
      priceChange: 8.2,
      address: "0x2345678901234567890123456789012345678901",
      symbol: "FRIES"
    },
    {
      id: "3",
      name: "glitch prayer angel",
      creator: "lynthgc",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      marketCap: "$62.33",
      price: "$1.24",
      holders: 3,
      timeAgo: "16m",
      priceChange: 15.7,
      address: "0x3456789012345678901234567890123456789012",
      symbol: "ANGEL"
    },
    {
      id: "4",
      name: "Digital Dreams",
      creator: "cryptoartist",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      marketCap: "$156.8",
      price: "$3.42",
      holders: 8,
      timeAgo: "22m",
      priceChange: -2.1,
      address: "0x4567890123456789012345678901234567890123",
      symbol: "DREAMS"
    },
    {
      id: "5",
      name: "Neon City",
      creator: "urbanexplorer",
      image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&h=300&fit=crop",
      marketCap: "$89.2",
      price: "$2.15",
      holders: 5,
      timeAgo: "28m",
      priceChange: 7.3,
      address: "0x5678901234567890123456789012345678901234",
      symbol: "NEON"
    },
    {
      id: "6",
      name: "Space Odyssey",
      creator: "cosmicvibes",
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop",
      marketCap: "$234.7",
      price: "$5.67",
      holders: 12,
      timeAgo: "35m",
      priceChange: 9.8,
      address: "0x6789012345678901234567890123456789012345",
      symbol: "SPACE"
    },
    {
      id: "7",
      name: "Ocean Waves",
      creator: "aquamarine",
      image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
      marketCap: "$78.4",
      price: "$1.89",
      holders: 6,
      timeAgo: "42m",
      priceChange: -0.5,
      address: "0x7890123456789012345678901234567890123456",
      symbol: "WAVES"
    },
    {
      id: "8",
      name: "Forest Spirits",
      creator: "naturelover",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
      marketCap: "$67.1",
      price: "$1.23",
      holders: 4,
      timeAgo: "1h",
      priceChange: 3.2,
      address: "0x8901234567890123456789012345678901234567",
      symbol: "FOREST"
    }
  ];

  const categories = [
    { id: "all", name: "All Channels", icon: Hash },
    { id: "trending", name: "Trending", icon: TrendingUp },
    { id: "popular", name: "Popular", icon: Users },
    { id: "new", name: "New", icon: Plus },
  ];

  const filteredChannels = mockChannels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.creator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTradeChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setTradeModalOpen(true);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Channel Import Tab and Category Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Channel Import Tab */}
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-black hover:bg-primary/90 font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Import Channel
            </Button>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-black font-semibold"
                        : "bg-muted/20 text-muted-foreground hover:text-white hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Channels Grid */}
      <section className="px-4 md:px-8 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {filteredChannels.length === 0 ? (
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
                  {searchTerm ? `Search results for "${searchTerm}"` : "Trending Channels"}
                  <span className="text-muted-foreground ml-2">({filteredChannels.length})</span>
                </h2>
              </div>

              {/* Responsive Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredChannels.map((channel) => (
                    <div 
                    key={channel.id} 
                    className="compact-channel-card group cursor-pointer"
                    onClick={() => handleTradeChannel(channel)}
                  >
                      {/* Channel Icon */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 mx-auto">
                        <img 
                          src={channel.image} 
                          alt={channel.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                        />
                      </div>

                      {/* Channel Info */}
                      <div className="text-center space-y-1">
                        <h3 className="font-bold text-white text-sm leading-tight">
                          {channel.name}
                          <br />
                          <span className="text-xs text-muted-foreground font-normal">
                            ({channel.symbol})
                          </span>
                        </h3>

                        <div className="text-xs text-muted-foreground">
                          market cap: <span className="text-primary font-semibold">{channel.marketCap}</span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          replies: <span className="text-white font-semibold">{channel.holders * 30 + Math.floor(Math.random() * 50)}</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  className="border-border/50 hover:border-primary/50 transition-colors"
                >
                  View All Channels
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trade Modal */}
      {selectedChannel && (
        <TradeModal
          coin={{
            id: selectedChannel.id,
            name: selectedChannel.name,
            symbol: selectedChannel.symbol,
            address: selectedChannel.address,
            creator: selectedChannel.creator,
            createdAt: new Date().toISOString(),
          }}
          open={tradeModalOpen}
          onOpenChange={setTradeModalOpen}
        />
      )}

      {/* Create Coin Modal */}
      <CreateCoinModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </Layout>
  );
}