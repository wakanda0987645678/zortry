import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { zora, zoraSepolia } from 'wagmi/chains';

// WalletConnect project ID - will be set via environment variable
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID not set. Get one at https://cloud.walletconnect.com');
}

export const config = getDefaultConfig({
  appName: 'CoinIT',
  projectId: projectId || 'demo-project-id', // Fallback for development
  chains: [zora, zoraSepolia],
  transports: {
    [zora.id]: http(),
    [zoraSepolia.id]: http(),
  },
  ssr: false,
});
