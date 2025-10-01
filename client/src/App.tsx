import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "./lib/wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Creators from "@/pages/creators";
import Leaderboard from "@/pages/leaderboard";
import FAQ from "@/pages/faq";
import NotFound from "@/pages/not-found";

import "@rainbow-me/rainbowkit/styles.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/creators" component={Creators} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/faq" component={FAQ} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: 'hsl(262 83% 58%)',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <TooltipProvider>
            <div className="dark">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
