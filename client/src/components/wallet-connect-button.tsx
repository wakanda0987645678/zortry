import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function WalletConnectButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");

  const handleConnect = async () => {
    // Mock wallet connection
    const mockAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
    setAddress(mockAddress);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setAddress("");
    setIsConnected(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        className="font-mono"
        data-testid="button-disconnect-wallet"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow"
      data-testid="button-connect-wallet"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
