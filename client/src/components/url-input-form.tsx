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
    <div className="spotify-card rounded-xl p-4 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="url"
            id="contentUrl"
            placeholder="Paste any URL - YouTube, Medium, Spotify, GitHub..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-muted/50 border-border text-white placeholder:text-muted-foreground h-10 text-sm rounded-full px-4 focus:ring-2 focus:ring-primary"
            disabled={scrapeMutation.isPending}
            data-testid="input-content-url"
          />
          <Button
            type="submit"
            disabled={scrapeMutation.isPending}
            className="spotify-button h-10 px-4 text-sm"
            data-testid="button-scrape"
          >
            {scrapeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-1" />
                Import
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Supports YouTube, Spotify, Medium, Substack, GitHub, and more
        </p>
      </form>
    </div>
  );
}
