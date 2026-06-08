import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Gift } from "lucide-react";

interface BonusRule {
  id: string;
  name: string;
  rollover_multiplier: number;
  min_odds: number;
  max_conversion: number;
  status: string;
}

const BonusRules: React.FC = () => {
  const [rules, setRules] = useState<BonusRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setRules([]);
    } catch (err: any) {
      toast({ title: "Error loading rules", variant: "destructive" });
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
          <div className="h-10 w-10 rounded-lg bg-pink-100/20 flex items-center justify-center">
            <Gift className="h-6 w-6 text-pink-600" />
          </div>
          Bonus Rules
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Bonus Rules Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Rule Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Rollover x</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Min Odds</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Max Conversion</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No bonus rules configured yet. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule, idx) => (
                    <tr
                      key={rule.id}
                      className={`border-b border-border/20 transition-colors ${idx % 2 === 0 ? "bg-background/50" : "bg-background"} hover:bg-primary/5`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">{rule.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">{rule.rollover_multiplier}x</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">{rule.min_odds.toFixed(2)}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">₦{rule.max_conversion.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-100/30 text-green-700 border border-green-200/50">
                          {rule.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1.5">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8 gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BonusRules;
