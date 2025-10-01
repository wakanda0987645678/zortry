export async function uploadToIPFS(metadata: any): Promise<string> {
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
  
  if (!PINATA_JWT) {
    console.warn("PINATA_JWT not configured, using mock IPFS URI");
    return `ipfs://mock-${Math.random().toString(36).substring(7)}`;
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
          name: `${metadata.title}-metadata`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}
