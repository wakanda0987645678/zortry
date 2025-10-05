import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAccount } from "wagmi";
import {
  Play,
  Compass,
  Plus,
  Users,
  Trophy,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Hash,
  Search,
  Award,
  Menu,
  User,
  Moon,
  Sun,
  Bell,
} from "lucide-react";
import WalletConnectButton from "./wallet-connect-button";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { isConnected } = useAccount();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { address } = useAccount();

  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${address}/unread`],
    enabled: !!address,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const unreadCount = notifications.length;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Default to system theme if no theme is saved
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      localStorage.setItem("theme", initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/channels?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const desktopNavItems = [
    { href: "/", icon: Compass, label: "Explore" },
    { href: "/channels", icon: Hash, label: "Channels" },
    { href: "/creators", icon: Users, label: "Creators" },
    { href: "/rewards", icon: Award, label: "Analyzer" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/faq", icon: HelpCircle, label: "FAQ" },
  ];

  const mobileNavItems = [
    { href: "/", icon: Compass, label: "Explore" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/create", icon: Plus, label: "Create" },
    { href: "/channels", icon: Hash, label: "Channels" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const items = mobile ? mobileNavItems : desktopNavItems;

    return (
      <div className={`bg-black/90 ${mobile ? 'p-4' : 'p-6'} flex flex-col h-full`}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-black fill-current" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <span className="text-2xl font-bold text-white">CoinIT</span>
          )}
        </div>

        <nav className="space-y-4 mb-8 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "text-white bg-primary/20"
                      : "text-muted-foreground hover:text-white hover:bg-muted/10"
                  }`}
                  onClick={() => mobile && setMobileMenuOpen(false)}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  {(!sidebarCollapsed || mobile) && (
                    <span className="font-bold">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

      {(!sidebarCollapsed || mobile) && (
        <div className="bg-muted/20 rounded-lg p-4">
          <h3 className="font-bold text-white mb-2">Create Your First Coin</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Turn any blog post into a tradeable digital asset.
          </p>
          <Link href="/create">
            <button
              className="spotify-button w-full"
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              Get Started
            </button>
          </Link>
        </div>
      )}

      {!mobile && (
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
      )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex flex-col h-screen">
          {/* Mobile Header */}
          <header className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Menu className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SidebarContent mobile />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-black fill-current" />
                </div>
                <span className="text-lg font-bold text-white">CoinIT</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/notifications">
                <button className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${location === "/notifications" ? "bg-primary/20 text-primary" : "hover:bg-muted/20"}`}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </Link>
              <WalletConnectButton />
            </div>
          </header>

          {/* Mobile Main Content */}
          <main className="flex-1 overflow-y-auto pb-16">
            {children}
          </main>

          {/* Mobile Footer Navigation */}
          <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40">
            <div className="flex items-center justify-around py-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex flex-col items-center justify-center p-2 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium mt-1">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}>
          <SidebarContent />
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Top Navigation Bar */}
          <header className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-4 flex-1">
              {/* Desktop Search Bar */}
              <div className="flex-1 max-w-md">
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

              {/* Create Button */}
              <Link href="/create">
                <button className="flex items-center gap-2 bg-primary text-black hover:bg-primary/90 font-semibold px-4 py-2 rounded-full transition-colors">
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isConnected && (
                <Link href="/profile">
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/20 transition-colors text-muted-foreground hover:text-white"
                    data-testid="button-profile"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>
                </Link>
              )}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="icon"
                className="w-9 h-9"
                data-testid="button-toggle-theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <WalletConnectButton />
            </div>
          </header>

          {/* Desktop Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}