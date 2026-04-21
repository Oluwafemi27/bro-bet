import { useQuery } from "@tanstack/react-query";
import { isGameLiveOrUpcoming, GAMES_HOURLY_REFETCH_INTERVAL } from "@/utils/gameFilter";

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

const BASE = "https://www.thesportsdb.com/api/v1/json/123";
const LEAGUE_IDS = ["4445"]; // Boxing
const SEASONS = ["2026", "2027"];

function parseFighters(title: string): { home?: string; away?: string } {
  if (!title) return {};
  const parts = title.split(/\s+vs\.?\s+/i);
  if (parts.length === 2) {
    return { home: parts[0].trim(), away: parts[1].trim() };
  }
  return {};
}

async function fetchBoxing(): Promise<BoxingEvent[]> {
  const events: BoxingEvent[] = [];
  const seen = new Set<string>();
  const now = Date.now();
  const liveWindow = 4 * 60 * 60 * 1000; // 4h
  const upcomingWindow = 90 * 24 * 60 * 60 * 1000; // 90 days ahead

  for (const lid of LEAGUE_IDS) {
    const urls = [`${BASE}/eventsnextleague.php?id=${lid}`];
    for (const s of SEASONS) {
      urls.push(`${BASE}/eventsseason.php?id=${lid}&s=${s}`);
    }

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per URL

        const r = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!r.ok) {
          console.warn(`Failed to fetch ${url}:`, r.status);
          continue;
        }

        const j = await r.json();
        const arr = j.events || [];
        if (!Array.isArray(arr)) continue;

        for (const e of arr) {
          if (seen.has(e.idEvent)) continue;
          const status = (e.strStatus || "").toLowerCase();
          if (status.includes("finished") || status.includes("ft") || status.includes("ended")) continue;

          const ts = e.strTimestamp ? new Date(e.strTimestamp).getTime() : 0;
          if (ts && ts < now - liveWindow) continue;
          if (ts && ts > now + upcomingWindow) continue;

          seen.add(e.idEvent);
          const fighters = e.strHomeTeam && e.strAwayTeam
            ? { home: e.strHomeTeam, away: e.strAwayTeam }
            : parseFighters(e.strEvent || "");

          events.push({
            id: e.idEvent,
            title: e.strEvent,
            league: e.strLeague || "Boxing",
            homeTeam: fighters.home,
            awayTeam: fighters.away,
            date: e.dateEvent,
            time: e.strTime,
            timestamp: e.strTimestamp,
            thumb: e.strThumb,
            poster: e.strPoster,
            venue: e.strVenue,
            country: e.strCountry,
            isLive: ts > 0 && ts <= now && now - ts < liveWindow,
          });
        }
      } catch (e) {
        console.error('boxing fetch error for url', url, ':', (e as Error).message);
      }
    }
  }

  events.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });

  return events.slice(0, 40);
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
