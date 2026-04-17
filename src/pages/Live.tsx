import Layout from "@/components/layout/Layout";
import MatchCard from "@/components/MatchCard";
import MatchSkeleton from "@/components/MatchSkeleton";
import { useOdds } from "@/hooks/useOddsApi";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const Live = () => {
  const { data: odds, isLoading } = useOdds("soccer_epl", true);

  const now = Date.now();
  const matches = (odds || [])
    .filter((event: any) => new Date(event.commence_time).getTime() > now - 4 * 60 * 60 * 1000)
    .map((event: any) => ({
      id: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      homeOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.home_team)?.price || 1.5,
      drawOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === "Draw")?.price || 3.5,
      awayOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.away_team)?.price || 2.5,
      league: event.sport_title,
      isLive: true,
      time: "LIVE",
    }));

  return (
    <Layout>
      <div className="container space-y-4 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-destructive" />
          <h1 className="font-display text-2xl font-bold">Live Betting</h1>
          <Badge variant="destructive" className="animate-pulse-live">LIVE</Badge>
        </div>

        <p className="text-sm text-muted-foreground">Odds refresh every 10 seconds</p>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <MatchSkeleton key={i} />)
            : matches.length > 0
              ? matches.map((m: any) => <MatchCard key={m.id} {...m} />)
              : (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <Zap className="mx-auto mb-2 h-10 w-10" />
                  <p>No live matches at the moment</p>
                  <p className="text-xs">Check back during match hours for live odds</p>
                </div>
              )}
        </div>
      </div>
    </Layout>
  );
};

export default Live;
