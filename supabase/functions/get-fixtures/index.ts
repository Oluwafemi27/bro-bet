import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const oddsApiKey = Deno.env.get('THE_ODDS_API_KEY');

    if (!oddsApiKey) {
      return new Response(JSON.stringify({ fixtures: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const games: any[] = [];

    // Fetch football/soccer games from The Odds API
    try {
      // Get today's date for The Odds API
      const fromDate = now.toISOString().split('T')[0];
      const toDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Popular football leagues
      const regions = ['eu', 'uk', 'us'];
      const leaguePatterns = ['premier_league', 'laliga', 'bundesliga', 'serie_a', 'ligue_1', 'champions_league'];

      for (const region of regions) {
        const url = `https://api.the-odds-api.com/v4/sports/soccer_epl/events?apiKey=${oddsApiKey}&dateFormat=unix`;
        const res = await fetch(url);

        if (!res.ok) continue;

        const data = await res.json();

        if (data.events && Array.isArray(data.events)) {
          const currentTime = Math.floor(now.getTime() / 1000);
          const liveWindow = 2 * 60 * 60; // 2 hours after start = still "live"

          for (const event of data.events) {
            const startTime = event.commence_time || 0;
            const status = event.status || '';

            // Skip finished games
            if (status === 'completed') continue;

            // Skip games that started more than 2 hours ago
            if (startTime && startTime < currentTime - liveWindow) continue;

            games.push({
              id: event.id,
              home_team: event.home_team,
              away_team: event.away_team,
              commence_time: event.commence_time,
              status: status,
              isLive: startTime > 0 && startTime <= currentTime && currentTime - startTime < liveWindow,
              league: 'EPL',
            });
          }
        }
      }

      // Also try multiple football leagues
      const soccerLeagues = [
        'soccer_epl',           // Premier League
        'soccer_spain_la_liga', // La Liga
        'soccer_germany_bundesliga',
        'soccer_italy_serie_a',
        'soccer_france_ligue_1',
        'soccer_uefa_champs_league',
      ];

      for (const league of soccerLeagues) {
        try {
          const url = `https://api.the-odds-api.com/v4/sports/${league}/events?apiKey=${oddsApiKey}&dateFormat=unix`;
          const res = await fetch(url);

          if (!res.ok) continue;

          const data = await res.json();

          if (data.events && Array.isArray(data.events)) {
            const currentTime = Math.floor(now.getTime() / 1000);
            const liveWindow = 2 * 60 * 60;

            for (const event of data.events) {
              const startTime = event.commence_time || 0;
              const status = event.status || '';

              if (status === 'completed') continue;
              if (startTime && startTime < currentTime - liveWindow) continue;

              // Check if we already have this game
              if (games.some(g => g.id === event.id)) continue;

              games.push({
                id: event.id,
                home_team: event.home_team,
                away_team: event.away_team,
                commence_time: event.commence_time,
                status: status,
                isLive: startTime > 0 && startTime <= currentTime && currentTime - startTime < liveWindow,
                league: league.replace('soccer_', '').toUpperCase(),
              });
            }
          }
        } catch (e) {
          console.error(`Error fetching ${league}:`, e);
        }
      }

    } catch (e) {
      console.error('The Odds API error:', e);
    }

    return new Response(JSON.stringify({ fixtures: games }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message, fixtures: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
