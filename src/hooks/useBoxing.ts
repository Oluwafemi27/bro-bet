import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";
import { supabase } from "@/integrations/supabase/client";

export interface BoxingEvent {
  id: string;
  title: string;
  league: string;
  homeTeam?: string;
  awayTeam?: string;
  date?: string;
  time?: string;
  timestamp?: string;
  thumb?: string;
  poster?: string;
  venue?: string;
  country?: string;
  isLive?: boolean;
}

async function fetchBoxing(): Promise<BoxingEvent[]> {
  const { data, error } = await supabase.functions.invoke("get-boxing");
  
  if (error) {
    console.error("Error invoking get-boxing function:", error);
    return [];
  }

  return data?.events || [];
}

export function useBoxing(liveOnly = false) {
  return useQuery({
    queryKey: ["boxing", liveOnly],
    queryFn: fetchBoxing,
    staleTime: 1000 * 60 * 10,
    refetchInterval: GAMES_HOURLY_REFETCH_INTERVAL,
    select: (events) => {
      // Filter to only live or upcoming games using timestamp
      const filtered = events.filter((e) => isGameLiveOrUpcoming(e.timestamp));
      // If liveOnly is requested, further filter to only live events
      return liveOnly ? filtered.filter((e) => e.isLive) : filtered;
    },
  });
}
