import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known fighting league IDs in TheSportsDB
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SPORTSDB_API_KEY') || "123";
    const BASE = `https://www.thesportsdb.com/api/v1/json/${apiKey}`;
    const events: any[] = [];
    const seen = new Set<string>();
    const now = Date.now();
    const liveWindow = 4 * 60 * 60 * 1000; // 4h
    const upcomingWindow = 90 * 24 * 60 * 60 * 1000; // 90 days ahead

    // Try eventsnextleague first (next 15) and then season for more breadth
    for (const lid of LEAGUE_IDS) {
      const urls = [`${BASE}/eventsnextleague.php?id=${lid}`];
      for (const s of SEASONS) {
        urls.push(`${BASE}/eventsseason.php?id=${lid}&s=${s}`);
      }

      for (const url of urls) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          const j = await r.json();
          const arr = j.events || [];
          if (!Array.isArray(arr)) continue;

          for (const e of arr) {
            if (seen.has(e.idEvent)) continue;
            const status = (e.strStatus || "").toLowerCase();
            if (status.includes("finished") || status.includes("ft") || status.includes("ended")) continue;

            const ts = e.strTimestamp ? new Date(e.strTimestamp).getTime() : 0;
            // Skip events that are clearly in the past (more than liveWindow ago)
            if (ts && ts < now - liveWindow) continue;
            // Skip events too far in the future
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
          console.error('fetch error', url, e);
        }
      }
    }

    events.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });

    return new Response(JSON.stringify({ events: events.slice(0, 40) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message, events: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
