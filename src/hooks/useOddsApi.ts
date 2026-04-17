import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";

const ODDS_BASE = "https://api.the-odds-api.com/v4";
const ODDS_API_KEY = "64783c52fb02db93d5a68321a01a3e80";

async function fetchWithKey(path: string) {
  const res = await fetch(`${ODDS_BASE}${path}&apiKey=${ODDS_API_KEY}`);
  if (!res.ok) throw new Error(`Odds API error: ${res.status}`);
  return res.json();
}

export function useSports() {
  return useQuery({
    queryKey: ["odds-sports"],
    queryFn: () => fetchWithKey("/sports?all=false"),
    staleTime: 1000 * 60 * 10,
  });
}

export function useOdds(sport: string, live = false) {
  return useQuery({
    queryKey: ["odds", sport, live],
    queryFn: () =>
      fetchWithKey(
        `/sports/${sport}/odds?regions=eu&markets=h2h&oddsFormat=decimal${live ? "&eventIds=" : ""}`
      ),
    refetchInterval: GAMES_HOURLY_REFETCH_INTERVAL,
    enabled: !!sport,
    select: (events) => events.filter((event: any) => isGameLiveOrUpcoming(event.commence_time)),
  });
}
