import Layout from "@/components/layout/Layout";
import MatchCard from "@/components/MatchCard";
import MatchSkeleton from "@/components/MatchSkeleton";
import { useOdds } from "@/hooks/useOddsApi";
import { useBasketball } from "@/hooks/useBasketball";
import { useBoxing } from "@/hooks/useBoxing";
import { formatGameDay } from "@/utils/formatGameDay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useState } from "react";

type SportFilter = "all" | "football" | "basketball" | "boxing";

const Live = () => {
  const [activeSport, setActiveSport] = useState<SportFilter>("all");

  // Fetch data from all sports
  const { data: odds = [], isLoading: footballLoading, error: footballError } = useOdds("soccer_epl", true);
  const { data: basketballGames = [], isLoading: basketballLoading, error: basketballError } = useBasketball();
  const { data: boxingEvents = [], isLoading: boxingLoading, error: boxingError } = useBoxing();

  const isLoading = footballLoading || basketballLoading || boxingLoading;
  const hasErrors = footballError || basketballError || boxingError;

  if (hasErrors) {
    console.warn('Live page errors:', { footballError, basketballError, boxingError });
  }

  // Show games that are currently live (started within 4 hours) or starting soon (within 30 mins)
  const now = Date.now();
  const liveWindowMs = 4 * 60 * 60 * 1000; // 4 hours after start
  const upcomingWindowMs = 30 * 60 * 1000; // 30 minutes in future

  // Process football matches - show live (started <4hrs ago) or upcoming (starts within 30 mins)
  const footballMatches = (odds || [])
    .filter((event: any) => {
      const startTime = new Date(event.commence_time).getTime();
      const timeUntilStart = startTime - now;
      const isLive = timeUntilStart >= -liveWindowMs && timeUntilStart < 0;
      const isUpcoming = timeUntilStart >= 0 && timeUntilStart <= upcomingWindowMs;
      return isLive || isUpcoming;
    })
    .map((event: any) => ({
      id: event.id,
      sport: "football" as const,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      homeOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.home_team)?.price || 1.5,
      drawOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === "Draw")?.price || 3.5,
      awayOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.away_team)?.price || 2.5,
      league: event.sport_title,
      isLive: true,
      time: "LIVE",
      dayLabel: formatGameDay(event.commence_time),
    }));

  // Process basketball games - show live (started <4hrs ago) or upcoming (starts within 30 mins)
  const basketballMatches = (basketballGames || [])
    .filter((game: any) => {
      const startTime = new Date(game.commence_time).getTime();
      const timeUntilStart = startTime - now;
      const isLive = timeUntilStart >= -liveWindowMs && timeUntilStart < 0;
      const isUpcoming = timeUntilStart >= 0 && timeUntilStart <= upcomingWindowMs;
      return isLive || isUpcoming;
    })
    .map((game: any) => ({
      id: game.id,
      sport: "basketball" as const,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      homeLogo: game.homeLogo,
      awayLogo: game.awayLogo,
      homeOdds: 1.85,
      drawOdds: 3.5,
      awayOdds: 1.95,
      league: game.league,
      isLive: game.isLive,
      time: "LIVE",
      dayLabel: formatGameDay(game.commence_time),
    }));

  // Process boxing events - show live (started <4hrs ago) or upcoming (starts within 30 mins)
  const boxingMatches = (boxingEvents || [])
    .filter((event: any) => {
      const startTime = event.timestamp ? new Date(event.timestamp).getTime() : 0;
      if (!startTime) return false;
      const timeUntilStart = startTime - now;
      const isLive = timeUntilStart >= -liveWindowMs && timeUntilStart < 0;
      const isUpcoming = timeUntilStart >= 0 && timeUntilStart <= upcomingWindowMs;
      return isLive || isUpcoming;
    })
    .map((event: any) => ({
      id: event.id,
      sport: "boxing" as const,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      homeOdds: 1.75,
      drawOdds: 3.5,
      awayOdds: 2.10,
      league: event.league,
      isLive: event.isLive,
      time: "LIVE",
      dayLabel: formatGameDay(event.timestamp || event.date),
    }));

  // Combine and filter by sport
  let allMatches = [...footballMatches, ...basketballMatches, ...boxingMatches];

  if (activeSport !== "all") {
    allMatches = allMatches.filter((m) => m.sport === activeSport);
  }

  // Sort by start time
  allMatches.sort((a, b) => {
    const aTime = new Date(a.dayLabel).getTime();
    const bTime = new Date(b.dayLabel).getTime();
    return aTime - bTime;
  });

  return (
    <Layout>
      <div className="container space-y-4 py-4 min-h-full">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-destructive" />
          <h1 className="font-display text-2xl font-bold">Live Betting</h1>
          <Badge variant="destructive" className="animate-pulse-live">LIVE</Badge>
        </div>

        <p className="text-sm text-muted-foreground">Games starting within 30 minutes • Odds refresh every 10 seconds</p>

        {/* Sport Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All" },
            { id: "football", label: "Football" },
            { id: "basketball", label: "Basketball" },
            { id: "boxing", label: "Boxing" },
          ].map((sport) => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.id as SportFilter)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeSport === sport.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {sport.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <MatchSkeleton key={i} />)
            : allMatches.length > 0
              ? allMatches.map((m: any) => {
                  // For boxing, we need to handle different prop structure
                  if (m.sport === "boxing") {
                    return (
                      <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{m.league}</span>
                          <div className="flex items-center gap-2">
                            {m.isLive && (
                              <Badge variant="destructive" className="animate-pulse-live text-[10px]">
                                LIVE
                              </Badge>
                            )}
                            {m.dayLabel && <span className="text-xs text-muted-foreground">{m.dayLabel}</span>}
                          </div>
                        </div>
                        <h3 className="mb-3 text-sm font-semibold">{m.homeTeam} vs {m.awayTeam}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80">
                            {m.homeTeam}
                          </button>
                          <button className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80">
                            {m.awayTeam}
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return <MatchCard key={m.id} {...m} />;
                })
              : (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <Zap className="mx-auto mb-2 h-10 w-10" />
                  <p>No live matches right now</p>
                  <p className="text-xs">Showing games currently live or starting within 30 minutes</p>
                </div>
              )}
        </div>
      </div>
    </Layout>
  );
};

export default Live;
