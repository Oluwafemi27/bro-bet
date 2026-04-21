import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";

const ODDS_BASE = "https://api.the-odds-api.com/v4";
const ODDS_API_KEY = "64783c52fb02db93d5a68321a01a3e80";

async function fetchWithKey(path: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${ODDS_BASE}${path}&apiKey=${ODDS_API_KEY}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Odds API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Odds API fetch error:', (e as Error).message);
    return [];
  }
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
    select: (events) => {
      if (!Array.isArray(events)) return [];
      return events.filter((event: any) => event?.commence_time && isGameLiveOrUpcoming(event.commence_time));
    },
  });
}
