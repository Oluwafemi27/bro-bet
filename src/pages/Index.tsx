import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/HeroBanner";
import MatchCard from "@/components/MatchCard";
import MatchSkeleton from "@/components/MatchSkeleton";
import { useOdds } from "@/hooks/useOddsApi";
import { formatGameDay } from "@/utils/formatGameDay";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Zap, Trophy, Gamepad2, Activity, Swords, Tv, Clock } from "lucide-react";

const leagues = [
  { id: "all", label: "All" },
  { id: "soccer_epl", label: "EPL" },
  { id: "soccer_spain_la_liga", label: "La Liga" },
  { id: "soccer_uefa_champs_league", label: "UCL" },
  { id: "basketball_nba", label: "NBA" },
];

const quickLinks = [
  { to: "/my-bets", icon: Clock, label: "My Bets", color: "bg-primary" },
  { to: "/live", icon: Zap, label: "Live", color: "bg-destructive" },
  { to: "/basketball", icon: Activity, label: "Basketball", color: "bg-primary" },
  { to: "/boxing", icon: Swords, label: "Boxing", color: "bg-naija-gold" },
  { to: "/watch", icon: Tv, label: "Watch", color: "bg-secondary text-foreground" },
  { to: "/aviator", icon: Trophy, label: "Aviator", color: "bg-naija-gold" },
];

const Index = () => {
  const [activeLeague, setActiveLeague] = useState("soccer_epl");
  const sportKey = activeLeague === "all" ? "soccer_epl" : activeLeague;
  const { data: odds, isLoading, error } = useOdds(sportKey);

  const now = Date.now();
  const matches = (odds || [])
    .filter((event: any) => new Date(event.commence_time).getTime() > now - 3 * 60 * 60 * 1000)
    .map((event: any) => ({
      id: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      homeOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.home_team)?.price || 1.5,
      drawOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === "Draw")?.price || 3.5,
      awayOdds: event.bookmakers?.[0]?.markets?.[0]?.outcomes?.find((o: any) => o.name === event.away_team)?.price || 2.5,
      league: event.sport_title,
      time: new Date(event.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dayLabel: formatGameDay(event.commence_time),
    }));

  return (
    <Layout>
      <div className="container space-y-6 py-4">
        <HeroBanner />

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className={cn("flex flex-col items-center gap-1.5 rounded-xl p-3 text-primary-foreground transition-transform hover:scale-105", color)}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>

        {/* League Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeLeague === league.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {league.label}
            </button>
          ))}
        </div>

        {/* Matches */}
        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-foreground">Today's Matches</h2>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <MatchSkeleton key={i} />)
              : error
                ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-600">
                    <p className="font-semibold">Unable to load matches</p>
                    <p className="text-sm mt-2">{error instanceof Error ? error.message : "The odds API is temporarily unavailable. Please try again later."}</p>
                  </div>
                )
                : matches.length > 0
                  ? matches.map((m: any) => <MatchCard key={m.id} {...m} />)
                  : (
                    <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                      <p>No matches available right now. Check back later.</p>
                    </div>
                  )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
