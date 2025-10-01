import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout";

export default function Admin() {
  const { toast } = useToast();
  const [result, setResult] = useState<any>(null);

  const migrateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/migrate", {});
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Migration complete!",
        description: `Migrated ${data.count} out of ${data.total} coins`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coins"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Migration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-white">Admin Panel</h1>
        
        <Card className="p-6 bg-muted/20">
          <h2 className="text-2xl font-bold mb-4 text-white">Data Migration</h2>
          <p className="text-muted-foreground mb-6">
            Import coins from the old database into the current system.
          </p>
          
          <Button
            onClick={() => migrateMutation.mutate()}
            disabled={migrateMutation.isPending}
            className="spotify-button"
            data-testid="button-migrate"
          >
            {migrateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              'Run Migration'
            )}
          </Button>

          {result && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-bold text-white mb-2">Migration Result:</h3>
              <pre className="text-sm text-muted-foreground overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
