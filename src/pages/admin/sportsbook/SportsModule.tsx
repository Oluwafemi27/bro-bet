import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trophy, Zap, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SportsModule = () => {
  const [stats, setStats] = useState({
    activeMatches: 0,
    markets: 0,
    liveEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [matchesRes, marketsRes, liveRes] = await Promise.all([
          supabase.from("matches").select("*", { count: "exact", head: true }),
          supabase.from("odds_markets").select("*", { count: "exact", head: true }),
          supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "live")
        ]);

        setStats({
          activeMatches: matchesRes.count || 0,
          markets: marketsRes.count || 0,
          liveEvents: liveRes.count || 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Sportsbook Overview</h2>
        <Button
          className="gap-2"
          onClick={() => {
            // Will show modal/dialog when implemented
            console.log("Add event dialog coming soon");
          }}
        >
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Active Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-3xl font-bold text-blue-600">{stats.activeMatches}</p>}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Odds Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-3xl font-bold text-purple-600">{stats.markets}</p>}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-red-600" />
              Live Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-3xl font-bold text-red-600">{stats.liveEvents}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Sportsbook Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Default Margin</p>
                <p className="text-sm text-muted-foreground">Applied to all new markets</p>
              </div>
              <span className="font-bold text-lg">5.0%</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Auto-Settlement</p>
                <p className="text-sm text-muted-foreground">Automatically settle bets on match finish</p>
              </div>
              <Button size="sm" variant="outline" className="text-green-600 border-green-200">ENABLED</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sportsbook Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8 italic">No recent management activity logs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SportsModule;
