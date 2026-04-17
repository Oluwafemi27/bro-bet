import { useQuery } from "@tanstack/react-query";

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

const BALLDONTLIE_API_KEY = "edd8d78a-b27c-43b3-80ea-57c9c457a591";

async function fetchBasketball(): Promise<BasketballGame[]> {
  const games: BasketballGame[] = [];
  const now = new Date();
  const currentTime = Math.floor(now.getTime() / 1000);
  const liveWindow = 4 * 60 * 60; // 4 hours after start = still "live"

  try {
    const today = new Date();
    const start = today.toISOString().split('T')[0];
    const end = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://api.balldontlie.io/v1/games?start_date=${start}&end_date=${end}&per_page=50`;
    const res = await fetch(url, { headers: { Authorization: BALLDONTLIE_API_KEY } });
    if (res.ok) {
      const data = await res.json();
      for (const g of data.data || []) {
        const status: string = g.status || '';
        const lower = status.toLowerCase();

        // Skip finished games
        if (lower.includes('final') || lower.includes('ft') || lower.includes('ended')) continue;

        const statusAsDate = new Date(status);
        const isScheduledTimestamp = !isNaN(statusAsDate.getTime()) && status.includes('T');
        const isLive = !isScheduledTimestamp && !lower.includes('final') && status.trim() !== '' && !lower.includes('postponed');
        const commenceTime = isScheduledTimestamp ? status : (g.date || '');

        const gameTime = g.date ? new Date(g.date).getTime() / 1000 : 0;
        if (gameTime && gameTime < currentTime - liveWindow && lower.includes('final')) continue;

        games.push({
          id: `nba-${g.id}`,
          homeTeam: g.home_team.full_name,
          awayTeam: g.visitor_team.full_name,
          homeAbbr: g.home_team.abbreviation,
          awayAbbr: g.visitor_team.abbreviation,
          league: 'NBA',
          commence_time: commenceTime,
          status: isLive ? status : undefined,
          isLive,
        });
      }
    }
  } catch (e) {
    console.error('balldontlie error', e);
  }

  // ESPN NBA scoreboard fallback (no key needed)
  try {
    const espnRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
    if (espnRes.ok) {
      const espn = await espnRes.json();
      for (const ev of espn.events || []) {
        const state = ev.status?.type?.state;
        if (state === 'post') continue;

        const comp = ev.competitions?.[0];
        const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
        const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
        if (!home || !away) continue;

        const id = `espn-${ev.id}`;
        if (games.some((x) => x.homeTeam === home.team.displayName && x.awayTeam === away.team.displayName)) continue;

        const eventTime = new Date(ev.date).getTime() / 1000;
        if (eventTime < currentTime - liveWindow && state !== 'in') continue;

        games.push({
          id,
          homeTeam: home.team.displayName,
          awayTeam: away.team.displayName,
          homeLogo: home.team.logo,
          awayLogo: away.team.logo,
          league: 'NBA',
          commence_time: ev.date,
          status: ev.status?.type?.shortDetail,
          isLive: state === 'in',
        });
      }
    }
  } catch (e) {
    console.error('espn error', e);
  }

  return games;
}

export function useBasketball(liveOnly = false) {
  return useQuery({
    queryKey: ["basketball", liveOnly],
    queryFn: fetchBasketball,
    staleTime: 1000 * 60 * 2,
    refetchInterval: liveOnly ? 15000 : 1000 * 60 * 5,
    select: (games) => (liveOnly ? games.filter((g) => g.isLive) : games),
  });
}
