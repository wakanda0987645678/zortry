export async function uploadToIPFS(metadata: any): Promise<string> {
  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  
  console.log("PINATA_JWT available:", !!PINATA_JWT);
  console.log("Environment variables:", {
    VITE_PINATA_JWT: !!import.meta.env.VITE_PINATA_JWT,
    VITE_PINATA_API_KEY: !!import.meta.env.VITE_PINATA_API_KEY,
    VITE_NEXT_PUBLIC_GATEWAY_URL: !!import.meta.env.VITE_NEXT_PUBLIC_GATEWAY_URL
  });
  
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT not configured. Please ensure VITE_PINATA_JWT is set in your environment variables and accessible to the client.");
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
