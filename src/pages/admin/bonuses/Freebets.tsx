import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Ticket } from "lucide-react";

interface Freebet {
  id: string;
  user_id: string;
  amount: number;
  min_odds: number;
  expiry: string;
  status: string;
}

const Freebets: React.FC = () => {
  const [freebets, setFreebets] = useState<Freebet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFreebets();
  }, []);

  const loadFreebets = async () => {
    try {
      const mockFreebets: Freebet[] = [
        { id: "1", user_id: "user-1", amount: 5000, min_odds: 1.5, expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: "active" },
        { id: "2", user_id: "user-2", amount: 10000, min_odds: 2.0, expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: "active" },
        { id: "3", user_id: "user-3", amount: 2500, min_odds: 1.2, expiry: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: "expired" },
      ];
      setFreebets(mockFreebets);
    } catch (err: any) {
      toast({ title: "Error loading freebets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100/20 flex items-center justify-center">
            <Ticket className="h-6 w-6 text-orange-600" />
          </div>
          Free Bets
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Award Freebet
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Active Free Bets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-6">
            {freebets.map((freebet) => (
              <div key={freebet.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div>
                  <p className="font-semibold text-foreground">₦{freebet.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{freebet.user_id} • Min Odds: {freebet.min_odds}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Expires: {new Date(freebet.expiry).toLocaleDateString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                      freebet.status === "active"
                        ? "bg-green-100/30 text-green-700 border-green-200/50"
                        : "bg-red-100/30 text-red-700 border-red-200/50"
                    }`}>
                      {freebet.status.toUpperCase()}
                    </span>
                  </div>
                  <Button size="sm" variant="destructive" className="h-8 gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
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

export default Freebets;
