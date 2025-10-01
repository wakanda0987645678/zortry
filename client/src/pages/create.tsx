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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-4 text-white">
              Create Your <span className="spotify-green">Digital Coin</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground px-4">
              Transform any content into a tradeable digital asset - grants, songs, channels, articles, social media, and more.
            </p>
          </div>

          <div className="mb-6 sm:mb-8">
            <URLInputForm onScraped={handleScrapedData} />
          </div>

          {showPreview && scrapedData && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white text-center sm:text-left">Preview & Mint</h2>
              <ContentPreviewCard
                scrapedData={scrapedData}
                onCoinCreated={handleCoinCreated}
              />
            </div>
          )}

          {!showPreview && (
            <div className="bg-muted/10 rounded-xl p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">How it works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2 text-left">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold mb-2">1</div>
                  <h4 className="font-bold text-white">Import Content</h4>
                  <p className="text-sm text-muted-foreground">Paste any URL from supported platforms and we'll extract the content automatically.</p>
                </div>
                <div className="space-y-2 text-left">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold mb-2">2</div>
                  <h4 className="font-bold text-white">Preview & Customize</h4>
                  <p className="text-sm text-muted-foreground">Review the extracted content and customize your coin's metadata.</p>
                </div>
                <div className="space-y-2 text-left">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold mb-2">3</div>
                  <h4 className="font-bold text-white">Mint on Blockchain</h4>
                  <p className="text-sm text-muted-foreground">Deploy your coin to the Base network and start trading.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}