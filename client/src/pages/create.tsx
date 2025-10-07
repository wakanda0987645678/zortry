import { useState } from "react";
import URLInputForm from "@/components/url-input-form";
import ContentPreviewCard from "@/components/content-preview-card";
import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Link, Image, Film, Music, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Create() {
  const [showPreview, setShowPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleScrapedData = (data: any) => {
    setScrapedData(data);
    setShowPreview(true);
  };

  const handleCoinCreated = () => {
    setShowPreview(false);
    setScrapedData(null);
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setUploadedFile(null);
    setUploadPreviewUrl("");
    setUploadTitle("");
    setUploadDescription("");
    setUploadAuthor("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image, video, or audio file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(previewUrl);

    // Auto-fill title from filename
    if (!uploadTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setUploadTitle(nameWithoutExt);
    }
  };

  const handleUploadPreview = async () => {
    if (!uploadedFile || !uploadTitle) {
      toast({
        title: "Missing information",
        description: "Please upload a file and provide a title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Pinata
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      const { ipfsHash, url } = await uploadRes.json();

      // Create scraped data format from upload
      const uploadData = {
        title: uploadTitle,
        description: uploadDescription || `User uploaded ${uploadedFile.type.split('/')[0]} content`,
        image: url,
        url: url,
        author: uploadAuthor || "Anonymous Creator",
        publishDate: new Date().toISOString(),
        content: uploadDescription,
        platform: 'upload',
        type: uploadedFile.type.split('/')[0], // image, video, or audio
      };

      setScrapedData(uploadData);
      setShowPreview(true);
      
      toast({
        title: "Upload successful",
        description: "Review your content and create your coin",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!uploadedFile) return <FileText className="w-6 h-6" />;
    const type = uploadedFile.type.split('/')[0];
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'video': return <Film className="w-6 h-6" />;
      case 'audio': return <Music className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
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

          <Tabs defaultValue="import" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Import from URL
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="mt-6">
              <URLInputForm onScraped={handleScrapedData} />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      {uploadedFile ? (
                        <>
                          {getFileIcon()}
                          <p className="text-sm font-medium text-foreground">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          {uploadPreviewUrl && uploadedFile.type.startsWith('image/') && (
                            <img 
                              src={uploadPreviewUrl} 
                              alt="Preview" 
                              className="mt-2 max-h-48 rounded-lg"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Images, Videos, or Audio (Max 100MB)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upload-title">Title *</Label>
                      <Input
                        id="upload-title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Enter content title"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="upload-description">Description</Label>
                      <Textarea
                        id="upload-description"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Describe your content (optional)"
                        className="mt-1.5"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="upload-author">Creator Name</Label>
                      <Input
                        id="upload-author"
                        value={uploadAuthor}
                        onChange={(e) => setUploadAuthor(e.target.value)}
                        placeholder="Your name or username (optional)"
                        className="mt-1.5"
                      />
                    </div>

                    <Button 
                      onClick={handleUploadPreview}
                      disabled={isUploading || !uploadTitle}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          Preview & Create Coin
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

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