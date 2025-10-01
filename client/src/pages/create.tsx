
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
      <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-4 text-white">
            Create Your <span className="spotify-green">Digital Coin</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform any blog post or article into a tradeable digital asset.
          </p>
        </div>

        <div className="mb-8">
          <URLInputForm onScraped={handleScrapedData} />
        </div>

        {showPreview && scrapedData && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Preview & Mint</h2>
            <ContentPreviewCard 
              scrapedData={scrapedData} 
              onCoinCreated={handleCoinCreated}
            />
          </div>
        )}

        {!showPreview && (
          <div className="bg-muted/10 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">How it works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">1</div>
                <h4 className="font-bold text-white">Import Content</h4>
                <p className="text-sm text-muted-foreground">Paste any blog URL and we'll extract the content automatically.</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">2</div>
                <h4 className="font-bold text-white">Preview & Customize</h4>
                <p className="text-sm text-muted-foreground">Review the extracted content and customize your coin's metadata.</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">3</div>
                <h4 className="font-bold text-white">Mint on Blockchain</h4>
                <p className="text-sm text-muted-foreground">Deploy your coin to the Zora network and start trading.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
