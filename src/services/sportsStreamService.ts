/**
 * Sports Stream Service
 * Integrates with sportsrc.org API to fetch live sports matches with embed URLs
 */

export interface StreamSource {
  source?: string;
  name?: string;
  url?: string;
  embed?: string;
  language?: string;
  quality?: string;
}

export interface StreamMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  popular?: boolean;
  poster?: string;
  teams?: {
    home?: { name: string; badge?: string };
    away?: { name: string; badge?: string };
  };
  sources?: StreamSource[];
}

// Use Supabase proxy function which properly forwards to sportsrc.org
const API_BASE = "https://jynsqirfkkvcahtrbykj.supabase.co/functions/v1/get-streams";

/**
 * Fetch sports categories from the API
 */
export async function fetchSportCategories(): Promise<Array<{ id: string; name: string }>> {
  try {
    const url = `${API_BASE}?action=sports`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Sports API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data?.success && Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch sport categories:", error);
    return [];
  }
}

/**
 * Fetch all matches for a category
 */
export async function fetchMatches(category: string = "football"): Promise<StreamMatch[]> {
  try {
    const url = `${API_BASE}?action=matches&category=${encodeURIComponent(category)}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Matches API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Extract matches array
    const matches = data?.success && Array.isArray(data.data) ? data.data : [];

    return matches.map((m: any) => ({
      id: m.id || m.matchId || String(Math.random()).slice(-8),
      title: m.title || 
             m.name ||
             (m.homeTeam || m.home || "Home") + " vs " + (m.awayTeam || m.away || "Away"),
      category: m.category || category,
      date: m.date ? new Date(m.date).getTime() : Date.now(),
      poster: m.poster || m.thumbnail || m.image,
      popular: m.popular || false,
      teams: {
        home: {
          name: m.homeTeam || m.home?.name || m.teams?.home?.name,
          badge: m.homeTeamBadge || m.teams?.home?.badge || m.home?.badge,
        },
        away: {
          name: m.awayTeam || m.away?.name || m.teams?.away?.name,
          badge: m.awayTeamBadge || m.teams?.away?.badge || m.away?.badge,
        },
      },
      sources: parseStreamSources(m),
    }));
  } catch (error) {
    console.error(`Failed to fetch matches for category ${category}:`, error);
    return [];
  }
}

/**
 * Parse stream sources from match data
 */
function parseStreamSources(match: any): StreamSource[] {
  const sources: StreamSource[] = [];

  // If match has sources array, use it
  if (Array.isArray(match.sources) && match.sources.length > 0) {
    sources.push(...match.sources);
  }

  // If match has streamUrl or embed, add as primary source
  if (match.streamUrl) {
    sources.push({
      url: match.streamUrl,
      embed: match.streamUrl,
      name: match.streamName || "Stream",
      quality: match.streamQuality,
    });
  }

  if (match.embed && !match.streamUrl) {
    sources.push({
      url: match.embed,
      embed: match.embed,
      name: "Stream",
    });
  }

  // Check for multiple quality variants
  if (match.stream_hd) {
    sources.push({
      url: match.stream_hd,
      embed: match.stream_hd,
      name: "HD Stream",
      quality: "HD",
    });
  }

  if (match.stream_sd) {
    sources.push({
      url: match.stream_sd,
      embed: match.stream_sd,
      name: "SD Stream",
      quality: "SD",
    });
  }

  return sources;
}

/**
 * Fetch match details with all stream information
 */
export async function fetchMatchDetail(
  category: string, 
  matchId: string
): Promise<StreamMatch | null> {
  try {
    const url = `${API_BASE}?action=detail&category=${encodeURIComponent(category)}&id=${encodeURIComponent(matchId)}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Match detail API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data?.success || !data.data) {
      return null;
    }

    const m = data.data;

    return {
      id: m.id || m.matchId || matchId,
      title: m.title || 
             m.name ||
             (m.homeTeam || m.home || "Home") + " vs " + (m.awayTeam || m.away || "Away"),
      category: m.category || category,
      date: m.date ? new Date(m.date).getTime() : Date.now(),
      poster: m.poster || m.thumbnail || m.image,
      popular: m.popular || false,
      teams: {
        home: {
          name: m.homeTeam || m.home?.name || m.teams?.home?.name,
          badge: m.homeTeamBadge || m.teams?.home?.badge || m.home?.badge,
        },
        away: {
          name: m.awayTeam || m.away?.name || m.teams?.away?.name,
          badge: m.awayTeamBadge || m.teams?.away?.badge || m.away?.badge,
        },
      },
      sources: parseStreamSources(m),
    };
  } catch (error) {
    console.error(`Failed to fetch match detail for ${matchId}:`, error);
    return null;
  }
}

/**
 * Filter matches by category/sport
 */
export function filterMatchesByCategory(matches: StreamMatch[], category: string): StreamMatch[] {
  if (!category || category === "all") return matches;
  return matches.filter((m) => m.category.toLowerCase() === category.toLowerCase());
}

/**
 * Filter live matches
 */
export function getLiveMatches(matches: StreamMatch[]): StreamMatch[] {
  const now = Date.now();
  return matches.filter((m) => {
    // Match is live if it started in the last 4 hours
    const timeSinceStart = now - m.date;
    return timeSinceStart >= 0 && timeSinceStart < 4 * 60 * 60 * 1000;
  });
}

/**
 * Get unique categories from matches
 */
export function getCategoriesFromMatches(matches: StreamMatch[]): Array<{ id: string; name: string }> {
  const categoriesSet = new Set<string>();
  matches.forEach((m) => {
    if (m.category) categoriesSet.add(m.category);
  });

  return Array.from(categoriesSet)
    .sort()
    .map((cat) => ({
      id: cat.toLowerCase(),
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));
}
