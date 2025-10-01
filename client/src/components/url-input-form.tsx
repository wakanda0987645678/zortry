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
    <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="blogUrl" className="block text-sm font-medium text-foreground mb-2">
            Enter Blog or Article URL
          </label>
          <div className="flex gap-3">
            <Input
              type="url"
              id="blogUrl"
              placeholder="https://medium.com/@author/amazing-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-muted border-input text-foreground placeholder:text-muted-foreground"
              disabled={scrapeMutation.isPending}
              data-testid="input-blog-url"
            />
            <Button
              type="submit"
              disabled={scrapeMutation.isPending}
              className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow"
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
                  Scrape
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground text-left">
          Supports: Medium, personal blogs, news articles, and most web content
        </div>
      </form>
    </div>
  );
}
