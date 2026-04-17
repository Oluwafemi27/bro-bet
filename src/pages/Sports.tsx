import Layout from "@/components/layout/Layout";
import MatchCard from "@/components/MatchCard";
import MatchSkeleton from "@/components/MatchSkeleton";
import { useOdds, useSports } from "@/hooks/useOddsApi";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Sports = () => {
  const { data: sports } = useSports();
  const [activeSport, setActiveSport] = useState("soccer_epl");
  const [search, setSearch] = useState("");
  const { data: odds, isLoading } = useOdds(activeSport);

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
    }))
    .filter((m: any) =>
      search ? m.homeTeam.toLowerCase().includes(search.toLowerCase()) || m.awayTeam.toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <Layout>
      <div className="container space-y-4 py-4">
        <h1 className="font-display text-2xl font-bold">Sports</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(sports || []).slice(0, 10).map((s: any) => (
            <button
              key={s.key}
              onClick={() => setActiveSport(s.key)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                activeSport === s.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <MatchSkeleton key={i} />)
            : matches.map((m: any) => <MatchCard key={m.id} {...m} />)}
        </div>
      </div>
    </Layout>
  );
};

export default Sports;
