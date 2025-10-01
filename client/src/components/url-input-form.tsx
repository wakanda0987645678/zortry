import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search } from "lucide-react";

interface URLInputFormProps {
  onScraped: (data: any) => void;
}

export default function URLInputForm({ onScraped }: URLInputFormProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/scrape", { url });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content scraped successfully!",
        description: "Review the preview below to create your coin.",
      });
      onScraped(data);
      setUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping failed",
        description: error.message || "Failed to scrape content from URL",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    scrapeMutation.mutate(url);
  };

  return (
    <div className="spotify-card rounded-2xl p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="contentUrl" className="block text-lg font-bold text-white mb-4">
            Enter Content URL
          </label>
          <div className="flex gap-4">
            <Input
              type="url"
              id="contentUrl"
              placeholder="https://youtube.com/@channel, https://medium.com/@author/article, or any supported URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-muted/50 border-border text-white placeholder:text-muted-foreground h-14 text-lg rounded-full px-6 focus:ring-2 focus:ring-primary"
              disabled={scrapeMutation.isPending}
              data-testid="input-content-url"
            />
            <Button
              type="submit"
              disabled={scrapeMutation.isPending}
              className="spotify-button h-14 px-8"
              data-testid="button-scrape"
            >
              {scrapeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <div>
            <span className="font-semibold text-white">Supported platforms:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
            <span>• YouTube channels</span>
            <span>• Spotify songs</span>
            <span>• Medium articles</span>
            <span>• Substack posts</span>
            <span>• Gitcoin grants</span>
            <span>• Giveth projects</span>
            <span>• TikTok profiles</span>
            <span>• Instagram pages</span>
            <span>• Twitter/X profiles</span>
            <span>• GitHub projects</span>
            <span>• Personal blogs</span>
            <span>• News articles</span>
          </div>
        </div>
      </form>
    </div>
  );
}
