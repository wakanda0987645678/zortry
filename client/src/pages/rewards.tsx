import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Reward } from "@shared/schema";
import { TrendingUp, CoinsIcon, Award, DollarSign, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAmount(amount: string, currency: string): string {
  const ethAmount = parseFloat(amount) / 1e18; // Convert from wei
  return `${ethAmount.toFixed(6)} ${currency}`;
}

export default function Rewards() {
  const [selectedTab, setSelectedTab] = useState<"all" | "platform" | "trade">("all");

  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  // Filter rewards by type
  const filteredRewards = selectedTab === "all"
    ? rewards
    : rewards.filter(reward => reward.type === selectedTab);

  // Calculate totals
  const totalEarnings = rewards.reduce((sum, reward) => {
    return sum + (parseFloat(reward.rewardAmount) / 1e18);
  }, 0);

  const platformEarnings = rewards
    .filter(r => r.type === 'platform')
    .reduce((sum, reward) => sum + (parseFloat(reward.rewardAmount) / 1e18), 0);

  const tradeEarnings = rewards
    .filter(r => r.type === 'trade')
    .reduce((sum, reward) => sum + (parseFloat(reward.rewardAmount) / 1e18), 0);

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-4 text-white">
              Trading <span className="spotify-green">Analyzer</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Track earnings from coin creation and trading fees.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="spotify-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalEarnings.toFixed(4)} ZORA</div>
                <p className="text-xs text-muted-foreground">
                  From {rewards.length} reward{rewards.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="spotify-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Platform Rewards</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{platformEarnings.toFixed(4)} ZORA</div>
                <p className="text-xs text-muted-foreground">
                  20% of all trading fees
                </p>
              </CardContent>
            </Card>

            <Card className="spotify-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Trade Rewards</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{tradeEarnings.toFixed(4)} ZORA</div>
                <p className="text-xs text-muted-foreground">
                  4% of facilitated trades
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rewards List */}
          <Card className="spotify-card">
            <CardHeader>
              <CardTitle className="text-white">Trading Analysis</CardTitle>
              <CardDescription>
                All rewards and trading activity from the Zora platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="all">All ({rewards.length})</TabsTrigger>
                  <TabsTrigger value="platform">Platform ({rewards.filter(r => r.type === 'platform').length})</TabsTrigger>
                  <TabsTrigger value="trade">Trade ({rewards.filter(r => r.type === 'trade').length})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/10">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-muted/20 rounded" />
                            <Skeleton className="h-3 w-24 bg-muted/20 rounded" />
                          </div>
                          <Skeleton className="h-6 w-20 bg-muted/20 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : filteredRewards.length === 0 ? (
                    <div className="text-center py-16">
                      <CoinsIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No rewards yet</h3>
                      <p className="text-muted-foreground">
                        {selectedTab === "all"
                          ? "Start creating and trading coins to earn rewards!"
                          : `No ${selectedTab} rewards found.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRewards.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={reward.type === 'platform' ? 'default' : 'secondary'}>
                                {reward.type === 'platform' ? 'Platform' : 'Trade'}
                              </Badge>
                              <span className="text-sm text-white font-medium">{reward.coinSymbol}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatAddress(reward.coinAddress)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>To: {formatAddress(reward.recipientAddress)}</span>
                              <span>{new Date(reward.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">
                                {formatAmount(reward.rewardAmount, reward.rewardCurrency)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {reward.type === 'platform' ? '20% of fees' : '4% of trade'}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://basescan.org/tx/${reward.transactionHash}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}