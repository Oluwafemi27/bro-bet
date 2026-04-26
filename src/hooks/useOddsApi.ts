import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";
import { supabase } from "@/integrations/supabase/client";

// Get the Supabase URL for edge functions
const getEdgeFunctionUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ||
    'https://wfyisqyqlijmaifunhqv.supabase.co';
  return supabaseUrl;
};

async function fetchWithKey(path: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const supabaseUrl = getEdgeFunctionUrl();
    const functionUrl = `${supabaseUrl}/functions/v1/odds-api?path=${encodeURIComponent(path)}`;

    console.log('Fetching from edge function:', functionUrl);

    const res = await fetch(functionUrl, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Odds API error: ${res.status}`, errorData);
      return [];
    }

    const data = await res.json();

    // Handle different response formats
    if (data.error) {
      console.error('Odds API returned error:', data.error);
      return [];
    }

    // Return the data - it could be an array or object with properties
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.events && Array.isArray(data.events)) {
      return data.events;
    }

    return [];
  } catch (e) {
    const error = e as Error;
    if (error.name === 'AbortError') {
      console.error('Odds API request timeout');
    } else {
      console.error('Odds API fetch error:', error.message);
    }
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
