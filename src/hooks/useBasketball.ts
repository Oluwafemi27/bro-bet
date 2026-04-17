import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";
import { supabase } from "@/integrations/supabase/client";

export interface BasketballGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeAbbr?: string;
  awayAbbr?: string;
  league: string;
  commence_time: string;
  status?: string;
  isLive?: boolean;
}

async function fetchBasketball(): Promise<BasketballGame[]> {
  try {
    const { data, error } = await supabase.functions.invoke("get-basketball");
    if (error) throw error;
    return data?.games || [];
  } catch (e) {
    console.error('basketball fetch error', e);
    return [];
  }
}

export function useBasketball(liveOnly = false) {
  return useQuery({
    queryKey: ["basketball", liveOnly],
    queryFn: fetchBasketball,
    staleTime: 1000 * 60 * 2,
    refetchInterval: GAMES_HOURLY_REFETCH_INTERVAL,
    select: (games) => {
      // Filter to only live or upcoming games
      const filtered = games.filter((g) => isGameLiveOrUpcoming(g.commence_time));
      // If liveOnly is requested, further filter to only live games
      return liveOnly ? filtered.filter((g) => g.isLive) : filtered;
    },
  });
}
