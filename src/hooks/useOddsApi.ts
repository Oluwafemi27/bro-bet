import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";
import { supabase } from "@/integrations/supabase/client";

async function fetchWithKey(path: string) {
  try {
    console.log('Fetching odds data for path:', path);

    const { data, error } = await supabase.functions.invoke("odds-api", {
      body: { path }
    });

    if (error) {
      console.error('Odds API function error:', error);
      return [];
    }

    // Handle different response formats
    if (data?.error) {
      console.error('Odds API returned error:', data.error);
      return [];
    }

    // Return the data - it could be an array or object with properties
    if (Array.isArray(data)) {
      return data;
    } else if (data?.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data?.events && Array.isArray(data.events)) {
      return data.events;
    }

    return [];
  } catch (e) {
    const error = e as Error;
    console.error('Odds API fetch error:', error.message);
    return [];
  }
}

export function useSports() {
  return useQuery({
    queryKey: ["odds-sports"],
    queryFn: () => fetchWithKey("/sports?all=false"),
    staleTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (events) => {
      if (!Array.isArray(events)) return [];
      return events.filter((event: any) => event?.commence_time && isGameLiveOrUpcoming(event.commence_time));
    },
  });
}
