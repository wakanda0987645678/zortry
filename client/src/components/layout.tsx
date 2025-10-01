import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import {
  Play,
  Home as HomeIcon,
  Plus,
  Users,
  Trophy,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Hash,
  Search,
} from "lucide-react";
import WalletConnectButton from "./wallet-connect-button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/channels?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/create", icon: Plus, label: "Create" },
    { href: "/channels", icon: Hash, label: "Channels" },
    { href: "/creators", icon: Users, label: "Creators" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/faq", icon: HelpCircle, label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className={`bg-black/90 p-6 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-black fill-current" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-2xl font-bold text-white">CoinIT</span>
            )}
          </div>

          <nav className="space-y-4 mb-8 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? "text-white bg-primary/20" 
                      : "text-muted-foreground hover:text-white hover:bg-muted/10"
                  }`}>
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-bold">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Create Your First Coin</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Turn any blog post into a tradeable digital asset.
              </p>
              <Link href="/create">
                <button className="spotify-button w-full">
                  Get Started
                </button>
              </Link>
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-8 h-8 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors mt-4"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
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
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search channels, coins, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/20 border-border focus:bg-muted/30 transition-colors"
                />
              </form>
            </div>
            
            <WalletConnectButton />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}