import { useState } from "react";
import URLInputForm from "@/components/url-input-form";
import ContentPreviewCard from "@/components/content-preview-card";
import Layout from "@/components/layout";

export default function Create() {
  const [showPreview, setShowPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);

  const handleScrapedData = (data: any) => {
    setScrapedData(data);
    setShowPreview(true);
  };

  const handleCoinCreated = () => {
    setShowPreview(false);
    setScrapedData(null);
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-5xl font-black mb-3 text-white">
              Create Your Coin
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform any content into a tradeable digital asset
            </p>
          </div>

          <div className="mb-8">
            <URLInputForm onScraped={handleScrapedData} />
          </div>

          {showPreview && scrapedData && (
            <div>
              <ContentPreviewCard
                scrapedData={scrapedData}
                onCoinCreated={handleCoinCreated}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}