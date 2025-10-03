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
    <div className="spotify-card rounded-2xl p-6 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="url"
            id="contentUrl"
            placeholder="Paste any URL - YouTube, Medium, Spotify, GitHub, and more..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-muted/50 border-border text-white placeholder:text-muted-foreground h-12 text-base rounded-full px-5 focus:ring-2 focus:ring-primary"
            disabled={scrapeMutation.isPending}
            data-testid="input-content-url"
          />
          <Button
            type="submit"
            disabled={scrapeMutation.isPending}
            className="spotify-button h-12 px-6"
            data-testid="button-scrape"
          >
            {scrapeMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Supports YouTube, Spotify, Medium, Substack, GitHub, social media, and more
        </p>
      </form>
    </div>
  );
}
