import { useQuery } from "@tanstack/react-query";
import { fetchLiveStreams, type LiveStreamResult } from "@/services/sportsStreamService";

export function useSportsStreams(query: string, enabled = true) {
  return useQuery<LiveStreamResult[]>({
    queryKey: ["youtubeLiveStreams", query],
    queryFn: () => fetchLiveStreams(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}
