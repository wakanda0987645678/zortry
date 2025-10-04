import { useQuery, useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Notification } from "@shared/schema";
import Layout from "@/components/layout";
import { Bell, Check, Trash2, DollarSign, TrendingUp, Coins as CoinsIcon, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notifications() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${address}`],
    enabled: !!address,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${address}`] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/notifications/${address}/read-all`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${address}`] });
      toast({
        title: "All notifications marked as read",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${address}`] });
      toast({
        title: "Notification deleted",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'coin_created':
        return <CoinsIcon className="w-5 h-5 text-blue-500" />;
      case 'trade':
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'sell':
        return <DollarSign className="w-5 h-5 text-yellow-500" />;
      case 'reward':
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view notifications</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="spotify-card p-4">
                  <Skeleton className="h-12 w-full rounded" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                You'll see notifications here when there's activity on your coins
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`spotify-card p-4 transition-all ${
                      !notification.read ? 'ring-1 ring-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="default" className="bg-primary/20 text-primary text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </section>
    </Layout>
  );
}