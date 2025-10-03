
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import URLInputForm from "@/components/url-input-form";
import ContentPreviewCard from "@/components/content-preview-card";

interface CreateCoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCoinModal({ open, onOpenChange }: CreateCoinModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);

  const handleScrapedData = (data: any) => {
    setScrapedData(data);
    setShowPreview(true);
  };

  const handleCoinCreated = () => {
    setShowPreview(false);
    setScrapedData(null);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setShowPreview(false);
      setScrapedData(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">
            Create Your Coin
          </DialogTitle>
          <p className="text-muted-foreground">
            Transform any content into a tradeable digital asset
          </p>
        </DialogHeader>

        <div className="mt-4">
          <URLInputForm onScraped={handleScrapedData} />
        </div>

        {showPreview && scrapedData && (
          <div className="mt-6">
            <ContentPreviewCard
              scrapedData={scrapedData}
              onCoinCreated={handleCoinCreated}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
