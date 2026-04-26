import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Plus, Wallet } from "lucide-react";

interface BetLimit {
  id: string;
  name: string;
  min_stake: number;
  max_stake: number;
  max_daily_loss: number;
  status: string;
}

const BettingLimits: React.FC = () => {
  const [limits, setLimits] = useState<BetLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const mockLimits: BetLimit[] = [
        { id: "1", name: "Global Default", min_stake: 100, max_stake: 50000000, max_daily_loss: 100000000, status: "active" },
        { id: "2", name: "Sports - 1x2", min_stake: 100, max_stake: 50000000, max_daily_loss: 100000000, status: "active" },
        { id: "3", name: "Casino", min_stake: 100, max_stake: 10000000, max_daily_loss: 50000000, status: "active" },
        { id: "4", name: "Virtuals", min_stake: 100, max_stake: 5000000, max_daily_loss: 20000000, status: "active" },
      ];
      setLimits(mockLimits);
    } catch (err: any) {
      toast({ title: "Error loading limits", variant: "destructive" });
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
          <div className="h-10 w-10 rounded-lg bg-blue-100/20 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          Betting Limits
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Limit
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Global Betting Limits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Limit Type</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Min Stake</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Max Stake</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Max Daily Loss</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {limits.map((limit, idx) => (
                  <tr
                    key={limit.id}
                    className={`border-b border-border/20 transition-colors ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{limit.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">₦{Number(limit.min_stake).toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">₦{Number(limit.max_stake).toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">₦{Number(limit.max_daily_loss).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-100/30 text-green-700 border border-green-200/50">
                        {limit.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BettingLimits;
