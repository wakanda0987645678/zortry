import { useState } from "react";
import type { Coin } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TradeModal from "@/components/trade-modal";
import {
  Copy,
  Check,
  TrendingUp,
  Calendar,
  User,
  Coins as CoinsIcon,
} from "lucide-react";

interface CoinCardProps {
  coin: Coin;
}

export default function CoinCard({ coin }: CoinCardProps) {
  const [copied, setCopied] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coin.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAge = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}m ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden hover-lift" data-testid={`card-coin-${coin.id}`}>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate flex items-center gap-2" data-testid={`text-coin-name-${coin.id}`}>
                <CoinsIcon className="w-4 h-4" />
                {coin.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono" data-testid={`text-coin-address-${coin.id}`}>
                {formatAddress(coin.address)}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="ml-2 h-8 w-8"
              data-testid={`button-copy-address-${coin.id}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CoinsIcon className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Symbol:</span>
              <span className="font-medium" data-testid={`text-coin-symbol-${coin.id}`}>{coin.symbol}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="w-3 h-3" />
              <span data-testid={`text-coin-creator-${coin.id}`}>{formatAddress(coin.creator)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span data-testid={`text-coin-age-${coin.id}`}>{formatAge(coin.createdAt)}</span>
            </div>
          </div>
          
          <Button
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow"
            onClick={() => setTradeModalOpen(true)}
            data-testid={`button-trade-${coin.id}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trade Now
          </Button>
        </div>
      </div>

      <TradeModal
        coin={coin}
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
      />
    </>
  );
}
