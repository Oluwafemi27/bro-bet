import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Plus, ToggleLeft, ToggleRight, Gamepad2 } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  status: string;
  game_count: number;
  rtp_avg: number;
}

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const mockProviders: Provider[] = [
        { id: "1", name: "Pragmatic Play", status: "active", game_count: 150, rtp_avg: 96.5 },
        { id: "2", name: "Evolution Gaming", status: "active", game_count: 80, rtp_avg: 97.2 },
        { id: "3", name: "NetEnt", status: "active", game_count: 120, rtp_avg: 96.8 },
        { id: "4", name: "Microgaming", status: "inactive", game_count: 95, rtp_avg: 96.2 },
      ];
      setProviders(mockProviders);
    } catch (err: any) {
      toast({ title: "Error loading providers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = (id: string) => {
    toast({ title: "Provider status updated" });
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100/20 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-blue-600" />
          </div>
          Game Providers
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Casino Providers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{provider.name}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>{provider.game_count} games</span>
                    <span>Avg RTP: {provider.rtp_avg}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                    provider.status === "active"
                      ? "bg-green-100/30 text-green-700 border-green-200/50"
                      : "bg-gray-100/30 text-gray-700 border-gray-200/50"
                  }`}>
                    {provider.status.toUpperCase()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleProvider(provider.id)}
                    className="h-10 w-10"
                  >
                    {provider.status === "active" ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Providers;
