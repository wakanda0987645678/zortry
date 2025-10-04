import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Coin } from "@shared/schema";
import CoinCard from "@/components/coin-card";
import Layout from "@/components/layout";
import {
  Coins as CoinsIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  PenTool,
} from "lucide-react";
import {
  SiYoutube,
  SiFarcaster,
  SiSpotify,
  SiTiktok,
  SiInstagram,
  SiMedium,
  SiSubstack,
  SiGithub,
  SiX,
} from "react-icons/si";
import { useState, useMemo, useRef } from "react";

type CoinWithPlatform = Coin & { platform?: string };

export default function Home() {
  const { data: coins = [], isLoading } = useQuery<CoinWithPlatform[]>({
    queryKey: ["/api/coins"],
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getCoinCount = (platformId: string) => {
    if (platformId === "all") return coins.length;
    return coins.filter((coin) => coin.platform === platformId).length;
  };

  const categories = [
    { id: "all", label: "All", Icon: Globe },
    { id: "youtube", label: "YouTube", Icon: SiYoutube },
    { id: "farcaster", label: "Farcaster", Icon: SiFarcaster },
    { id: "gitcoin", label: "Gitcoin", Icon: CoinsIcon },
    { id: "spotify", label: "Spotify", Icon: SiSpotify },
    { id: "tiktok", label: "TikTok", Icon: SiTiktok },
    { id: "instagram", label: "Instagram", Icon: SiInstagram },
    { id: "medium", label: "Medium", Icon: SiMedium },
    { id: "giveth", label: "Giveth", Icon: CoinsIcon },
    { id: "twitter", label: "Twitter", Icon: SiX },
    { id: "blog", label: "Blog", Icon: PenTool },
  ];

  const filteredCoins = useMemo(() => {
    if (selectedCategory === "all") return coins;
    return coins.filter((coin) => coin.platform === selectedCategory);
  }, [coins, selectedCategory]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Layout>
      {/* Category Bar */}
      <section className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full border border-border/50 hover:bg-muted/30 transition-all opacity-0 group-hover:opacity-100"
              data-testid="button-scroll-left"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            {/* Category Chips */}
            <div
              ref={scrollContainerRef}
              className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => {
                const IconComponent = category.Icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    }`}
                    data-testid={`button-category-${category.id}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full border border-border/50 hover:bg-muted/30 transition-all opacity-0 group-hover:opacity-100"
              data-testid="button-scroll-right"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Trending Coins Section */}
      <section className="p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="spotify-card rounded-xl overflow-hidden p-3 sm:p-4 space-y-3"
                >
                  <div className="aspect-square w-full bg-muted/20 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-muted/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted/20 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-muted/20 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCoins.length === 0 ? (
            <div className="text-center py-8 sm:py-16">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CoinsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                No coins yet
              </h3>
              <p className="text-muted-foreground mb-4 sm:mb-6 px-4">
                Import your content, earn forever!
              </p>
              <Link href="/create">
                <button className="spotify-button">Create a coin</button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
              {filteredCoins.map((coin) => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
