import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Plus, Wallet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BetLimit {
  id: string;
  user_id: string | null;
  max_bet: number | null;
  max_daily_win: number | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  }
}

const BettingLimits: React.FC = () => {
  const [limits, setLimits] = useState<BetLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadLimits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("betting_limits")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLimits(data || []);
    } catch (err: any) {
      toast({ title: "Error loading limits", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLimits();

    const channel = supabase
      .channel("betting-limits-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "betting_limits" },
        () => {
          loadLimits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        <Button
          className="gap-2"
          onClick={() => toast({ title: "New Limit dialog not yet implemented", description: "This feature is coming soon." })}
        >
          <Plus className="h-4 w-4" />
          New Limit
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Configured Betting Limits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/30">
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">User / Scope</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Max Bet</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Max Daily Win</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Created</th>
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
                      <td className="px-6 py-4 font-medium text-foreground">
                        {limit.profiles ? (
                          <>
                            <div>{limit.profiles.full_name}</div>
                            <div className="text-xs text-muted-foreground">{limit.profiles.email}</div>
                          </>
                        ) : (
                          <span className="italic">Global Scope</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">
                        {limit.max_bet ? `₦${Number(limit.max_bet).toLocaleString()}` : "No Limit"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">
                        {limit.max_daily_win ? `₦${Number(limit.max_daily_win).toLocaleString()}` : "No Limit"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(limit.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => toast({ title: "Edit Limit dialog not yet implemented", description: "This feature is coming soon." })}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {limits.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        <Wallet className="h-12 w-12 mx-auto opacity-20 mb-3" />
                        <p>No custom betting limits configured.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BettingLimits;
