import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Edit, Plus, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Odds {
  id: string;
  match: string;
  market: string;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  margin: number;
  last_updated: string;
}

const OddsControl: React.FC = () => {
  const [odds, setOdds] = useState<Odds[]>([]);
  const [filteredOdds, setFilteredOdds] = useState<Odds[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loadOdds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("odds_markets")
        .select(`
          *,
          matches (
            home_team,
            away_team
          )
        `);

      if (error) throw error;

      // Group by match and market
      const grouped: Record<string, any> = {};
      data?.forEach((o: any) => {
        const key = `${o.match_id}-${o.market_name}`;
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            match: `${o.matches?.home_team} vs ${o.matches?.away_team}`,
            market: o.market_name,
            home_odds: 0,
            draw_odds: 0,
            away_odds: 0,
            margin: 0,
            last_updated: o.created_at
          };
        }
        if (o.outcome_name === 'Home' || o.outcome_name === '1') grouped[key].home_odds = o.odds;
        if (o.outcome_name === 'Draw' || o.outcome_name === 'X') grouped[key].draw_odds = o.odds;
        if (o.outcome_name === 'Away' || o.outcome_name === '2') grouped[key].away_odds = o.odds;
      });

      const formattedOdds = Object.values(grouped).map(o => {
        // Simple margin calculation if all odds > 0
        let margin = 0;
        if (o.home_odds > 0 && o.away_odds > 0) {
          margin = (1/o.home_odds + (o.draw_odds > 0 ? 1/o.draw_odds : 0) + 1/o.away_odds - 1) * 100;
        }
        return { ...o, margin: Number(margin.toFixed(1)) };
      });

      setOdds(formattedOdds);
    } catch (err: any) {
      toast({ title: "Error loading odds", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOdds();
    const channel = supabase
      .channel("odds-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "odds_markets" },
        () => {
          loadOdds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filterOdds = () => {
    let filtered = odds;
    if (searchTerm) {
      filtered = filtered.filter((o) =>
        o.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.market.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOdds(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            Odds Control
          </h1>
          <p className="text-muted-foreground mt-1">Manage odds for all matches</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const csv = "Match,Market,Home,Draw,Away,Margin,Updated\n" +
                filteredOdds.map(o => `"${o.match}",${o.market},${o.home_odds.toFixed(2)},${o.draw_odds.toFixed(2)},${o.away_odds.toFixed(2)},${o.margin}%,${new Date(o.last_updated).toLocaleTimeString()}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "odds.csv";
              a.click();
              window.URL.revokeObjectURL(url);
              toast({ title: "Odds exported successfully" });
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => toast({ title: "Bulk Update dialog not yet implemented", description: "This feature is coming soon." })}
          >
            <Plus className="h-4 w-4" />
            Bulk Update
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by match..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-primary/20 focus:border-primary/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Odds Table */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Match Odds</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Match</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Market</th>
                  <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Home</th>
                  <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Draw</th>
                  <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Away</th>
                  <th className="px-6 py-4 text-center font-semibold text-muted-foreground">Margin</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Updated</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOdds.map((odd, idx) => (
                  <tr
                    key={odd.id}
                    className={`border-b border-border/20 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{odd.match}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{odd.market}</td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-blue-600">{odd.home_odds.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-gray-600">{odd.draw_odds.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-red-600">{odd.away_odds.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        odd.margin > 4
                          ? "bg-green-100/30 text-green-700 border-green-200/50"
                          : "bg-amber-100/30 text-amber-700 border-amber-200/50"
                      }`}>
                        {odd.margin}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(odd.last_updated).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => toast({ title: "Adjust Odds dialog not yet implemented", description: "This feature is coming soon." })}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOdds.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto opacity-20 mb-3" />
              <p className="font-medium">No odds found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OddsControl;
