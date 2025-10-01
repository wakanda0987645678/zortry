import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { uploadToIPFS } from "@/lib/pinata";
import { Calendar, User, ExternalLink, Loader2, Plus } from "lucide-react";

interface ContentPreviewCardProps {
  scrapedData: any;
  onCoinCreated: () => void;
}

export default function ContentPreviewCard({ scrapedData, onCoinCreated }: ContentPreviewCardProps) {
  const { toast } = useToast();
  const [coinSymbol, setCoinSymbol] = useState(
    scrapedData.title
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 5)
  );

  const createCoinMutation = useMutation({
    mutationFn: async () => {
      // Upload metadata to IPFS
      const metadata = {
        title: scrapedData.title,
        description: scrapedData.description,
        image: scrapedData.image,
        originalUrl: scrapedData.url,
        author: scrapedData.author,
        publishDate: scrapedData.publishDate,
        content: scrapedData.content,
      };

      const ipfsUri = await uploadToIPFS(metadata);

      // Create coin record
      const coinData = {
        name: scrapedData.title,
        symbol: coinSymbol,
        address: `0x${Math.random().toString(16).substring(2, 42)}`, // Placeholder - will be replaced by actual Zora contract address
        creator: "0x0000000000000000000000000000000000000000", // Will be replaced with actual wallet address
        scrapedContentId: scrapedData.id,
        ipfsUri,
      };

      const res = await apiRequest("POST", "/api/coins", coinData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Coin created successfully!",
        description: "Your coin is now live on the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coins"] });
      onCoinCreated();
    },
    onError: (error: Error) => {
      toast({
        title: "Coin creation failed",
        description: error.message || "Failed to create coin",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card rounded-2xl p-6 hover-lift">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {scrapedData.image && (
            <img
              src={scrapedData.image}
              alt={scrapedData.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-preview-title">
              {scrapedData.title}
            </h3>
            {scrapedData.description && (
              <p className="text-sm text-muted-foreground" data-testid="text-preview-description">
                {scrapedData.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {scrapedData.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span data-testid="text-preview-author">{scrapedData.author}</span>
              </div>
            )}
            {scrapedData.publishDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span data-testid="text-preview-date">{formatDate(scrapedData.publishDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              <a 
                href={scrapedData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="truncate max-w-xs hover:text-foreground"
                data-testid="link-preview-url"
              >
                {new URL(scrapedData.url).hostname}
              </a>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <Label htmlFor="coinSymbol" className="block text-sm font-medium mb-2">
              Coin Symbol (Auto-generated)
            </Label>
            <div className="flex gap-3">
              <Input
                id="coinSymbol"
                type="text"
                value={coinSymbol}
                onChange={(e) => setCoinSymbol(e.target.value.toUpperCase().substring(0, 5))}
                className="flex-1 bg-muted border-input text-foreground font-mono"
                maxLength={5}
                disabled={createCoinMutation.isPending}
                data-testid="input-coin-symbol"
              />
              <Button
                onClick={() => createCoinMutation.mutate()}
                disabled={createCoinMutation.isPending || !coinSymbol}
                className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow"
                data-testid="button-create-coin"
              >
                {createCoinMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Coin
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
