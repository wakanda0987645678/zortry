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
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(savedTheme);
    } else {
      // Default to system theme if no theme is saved
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      localStorage.setItem("theme", initialTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
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
      <div className={`bg-sidebar ${mobile ? 'p-4' : 'p-6'} flex flex-col h-full`}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-black fill-current" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <span className="text-2xl font-bold text-foreground">CoinIT</span>
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
                      ? "text-foreground bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
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

        {/* Social Links */}
        {mobile && (
          <div className="mb-4">
            <div className="px-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Community
              </span>
            </div>
            <div className="flex items-center gap-2 px-2">
              <a
                href="https://twitter.com/coinit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/20 hover:bg-primary/20 transition-colors group"
                title="Twitter"
              >
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://discord.gg/coinit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/20 hover:bg-primary/20 transition-colors group"
                title="Discord"
              >
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a
                href="https://zora.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/20 hover:bg-primary/20 transition-colors group"
                title="Zora"
              >
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        )}

      {(!sidebarCollapsed || mobile) && (
        <div className="bg-muted/20 rounded-lg p-4">
          <h3 className="font-bold text-foreground mb-2">Create Your First Coin</h3>
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
            <ChevronRight className="w-4 h-4 text-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-foreground" />
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
                <span className="text-lg font-bold text-foreground">CoinIT</span>
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/20 transition-colors text-muted-foreground hover:text-foreground"
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
                className="w-9 h-9 text-foreground"
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