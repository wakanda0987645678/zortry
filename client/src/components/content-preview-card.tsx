import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { uploadToIPFS } from "@/lib/pinata";
import { createZoraCoin } from "@/lib/zora";
import { Calendar, User, ExternalLink, Loader2, Plus } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";

interface ContentPreviewCardProps {
  scrapedData: any;
  onCoinCreated: () => void;
}

export default function ContentPreviewCard({ scrapedData, onCoinCreated }: ContentPreviewCardProps) {
  const { toast } = useToast();
  const { address: walletAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
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
      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      // Upload metadata to IPFS for backup
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

      // Create pending coin record in database first (decouple from Zora blockchain)
      const pendingCoinData = {
        name: scrapedData.title,
        symbol: coinSymbol,
        creator: walletAddress,
        scrapedContentId: scrapedData.id,
        ipfsUri,
        status: 'pending' as const,
      };

      const createRes = await apiRequest("POST", "/api/coins", pendingCoinData);
      const createdCoin = await createRes.json();

      // Try to create on Zora blockchain (optional, won't block database save)
      let zoraCoinResult = null;
      try {
        const coinMetadata = {
          name: scrapedData.title,
          symbol: coinSymbol,
          description: scrapedData.description,
          image: scrapedData.image,
        };

        const { createZoraCoinWithWallet } = await import('@/lib/zora');

        if (walletClient) {
          zoraCoinResult = await createZoraCoinWithWallet(coinMetadata, walletAddress, walletClient);

          // Update coin with address and active status
          await apiRequest("PATCH", `/api/coins/${createdCoin.id}`, {
            address: zoraCoinResult.address,
            status: 'active' as const,
          });
        }
      } catch (zoraError) {
        console.warn("Zora blockchain creation failed, but coin saved to database:", zoraError);

        // Update status to failed since Zora creation didn't work
        try {
          await apiRequest("PATCH", `/api/coins/${createdCoin.id}`, {
            status: 'failed' as const,
          });
        } catch (updateError) {
          console.error("Failed to update coin status:", updateError);
        }
      }

      return { coin: createdCoin, zoraCoinResult };
    },
    onSuccess: (data) => {
      toast({
        title: "Coin created successfully!",
        description: data.zoraCoinResult 
          ? "Your coin is now live on Zora!" 
          : "Coin saved! Blockchain deployment pending.",
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
    <div className="glass-card rounded-xl p-4 hover-lift">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          {scrapedData.image && (
            <img
              src={scrapedData.image}
              alt={scrapedData.title}
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="md:col-span-2 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1" data-testid="text-preview-title">
              {scrapedData.title}
            </h3>
            {scrapedData.description && (
              <p className="text-xs text-muted-foreground line-clamp-2" data-testid="text-preview-description">
                {scrapedData.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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

          <div className="pt-3 border-t border-border">
            <Label htmlFor="coinSymbol" className="block text-xs font-medium mb-1.5">
              Coin Symbol
            </Label>
            <div className="flex gap-2">
              <Input
                id="coinSymbol"
                type="text"
                value={coinSymbol}
                onChange={(e) => setCoinSymbol(e.target.value.toUpperCase().substring(0, 5))}
                className="flex-1 bg-muted border-input text-foreground font-mono h-9 text-sm"
                maxLength={5}
                disabled={createCoinMutation.isPending}
                data-testid="input-coin-symbol"
              />
              <Button
                onClick={() => createCoinMutation.mutate()}
                disabled={createCoinMutation.isPending || !coinSymbol || !walletAddress || !walletClient}
                className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow h-9 px-4 text-sm"
                data-testid="button-create-coin"
                title={!walletAddress ? "Connect wallet to create coins" : !walletClient ? "Wallet client not ready" : ""}
              >
                {createCoinMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Create
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