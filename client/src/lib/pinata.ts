export async function uploadToIPFS(metadata: any): Promise<string> {
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
  
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT not configured. Please set VITE_PINATA_JWT environment variable.");
  }

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${metadata.title || 'coin'}-metadata`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Pinata upload failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("IPFS upload error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload metadata to IPFS");
  }
}
