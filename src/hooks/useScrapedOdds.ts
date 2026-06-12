import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScrapedMatch {
  id: string;
  home_team: string;
  away_team: string;
  league: string | null;
  sport: string;
  start_time: string;
  status: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
}

export const SCRAPED_SPORTS = [
  { key: "soccer", title: "Football" },
  { key: "basketball", title: "Basketball" },
  { key: "tennis", title: "Tennis" },
  { key: "ice_hockey", title: "Ice Hockey" },
];

export function useScrapedOdds(sport: string) {
  return useQuery({
    queryKey: ["scraped-odds", sport],
    queryFn: async () => {
      // Fetch matches scraped from the live odds feed
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("id, home_team, away_team, league, sport, start_time, status, external_id")
        .eq("sport", sport)
        .order("start_time", { ascending: true })
        .limit(50);

      if (matchesError) {
        console.error("Error fetching scraped matches:", matchesError);
        return [];
      }

      if (!matches || matches.length === 0) return [];

      const matchIds = matches.map((m) => m.id);

      // Fetch the 1X2 odds markets for these matches and pivot into home/draw/away
      const { data: markets, error: marketsError } = await supabase
        .from("odds_markets")
        .select("match_id, market_name, outcome_name, odds, status")
        .in("match_id", matchIds)
        .eq("market_name", "1X2");

      if (marketsError) {
        console.error("Error fetching odds markets:", marketsError);
      }

      const oddsByMatch: Record<string, { home_odds: number | null; draw_odds: number | null; away_odds: number | null }> = {};

      for (const row of markets || []) {
        const entry = oddsByMatch[row.match_id] || { home_odds: null, draw_odds: null, away_odds: null };
        const price = row.odds !== null ? Number(row.odds) : null;
        if (row.outcome_name === "1") entry.home_odds = price;
        else if (row.outcome_name === "X") entry.draw_odds = price;
        else if (row.outcome_name === "2") entry.away_odds = price;
        oddsByMatch[row.match_id] = entry;
      }

      return matches.map((m) => ({
        id: m.id,
        home_team: m.home_team,
        away_team: m.away_team,
        league: m.league,
        sport: m.sport,
        start_time: m.start_time,
        status: m.status,
        home_odds: oddsByMatch[m.id]?.home_odds ?? null,
        draw_odds: oddsByMatch[m.id]?.draw_odds ?? null,
        away_odds: oddsByMatch[m.id]?.away_odds ?? null,
      })) as ScrapedMatch[];
    },
    enabled: !!sport,
    refetchInterval: 60 * 1000,
    retry: 2,
  });
}
