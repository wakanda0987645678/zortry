
import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

export async function handleFileUpload(req: Request, res: Response) {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
    return res.status(500).json({ 
      error: "Pinata credentials not configured" 
    });
  }

  const form = formidable({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("File parse error:", err);
      return res.status(400).json({ error: "Failed to parse file upload" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Read file
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileName = file.originalFilename || `upload-${Date.now()}`;

      // Upload to Pinata
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' });
      formData.append('file', blob, fileName);

      const pinataMetadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', pinataMetadata);

      const uploadResponse = await fetch(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        {
          method: 'POST',
          headers: PINATA_JWT 
            ? { 'Authorization': `Bearer ${PINATA_JWT}` }
            : {
                'pinata_api_key': PINATA_API_KEY!,
                'pinata_secret_api_key': PINATA_SECRET_KEY!,
              },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Pinata upload error:", errorText);
        throw new Error(`Pinata upload failed: ${errorText}`);
      }

      const result = await uploadResponse.json();
      const ipfsHash = result.IpfsHash;
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud';
      const url = `${gatewayUrl}/ipfs/${ipfsHash}`;

      // Clean up temp file
      fs.unlinkSync(file.filepath);

      res.json({
        success: true,
        ipfsHash,
        url,
        fileName,
      });
    } catch (error) {
      console.error("Upload error:", error);
      
      // Clean up temp file on error
      try {
        fs.unlinkSync(file.filepath);
      } catch {}

      res.status(500).json({
        error: "Failed to upload file to IPFS",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
