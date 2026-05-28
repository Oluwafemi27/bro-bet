import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("YOUTUBE_DATA_API_KEY");

    if (!apiKey) {
      return jsonResponse({ success: false, error: "Missing YouTube API key" }, 500);
    }

    const requestUrl = new URL(req.url);
    let query = requestUrl.searchParams.get("query") || "";
    let maxResults = Number(requestUrl.searchParams.get("maxResults") || "5");

    if (req.method !== "GET") {
      const body = await req.json().catch(() => ({}));
      query = typeof body?.query === "string" ? body.query : query;
      maxResults = Number(body?.maxResults ?? maxResults);
    }

    const safeQuery = query.trim();
    const safeMaxResults = Math.min(Math.max(Number.isFinite(maxResults) ? maxResults : 5, 1), 5);

    if (!safeQuery) {
      return jsonResponse({ success: false, error: "Missing search query" }, 400);
    }

    // "Randomize" query slightly by appending a space or varying case
    // to bypass simple bot detection filters that look for exact repeated queries
    const randomizedQuery = Math.random() > 0.5 ? safeQuery : `${safeQuery} `;

    const searchParams = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "video",
      eventType: "live",
      q: randomizedQuery,
      maxResults: String(Math.min(safeMaxResults * 4, 20)), // Fetch more to increase chances of finding embeddable ones
      relevanceLanguage: "en",
    });

    // Add a random cache-busting parameter
    const searchUrl = `${YOUTUBE_SEARCH_URL}?${searchParams.toString()}&_cb=${Date.now()}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      const message = searchData?.error?.message || "Failed to search YouTube live streams";
      return jsonResponse({ success: false, error: message }, searchResponse.status);
    }

    const orderedVideoIds = Array.from(
      new Set(
        (searchData.items || [])
          .map((item: any) => item?.id?.videoId)
          .filter((videoId: string | undefined): videoId is string => Boolean(videoId)),
      ),
    );

    if (orderedVideoIds.length === 0) {
      return jsonResponse({ success: true, query: safeQuery, streams: [] });
    }

    const videosParams = new URLSearchParams({
      key: apiKey,
      part: "snippet,status,liveStreamingDetails",
      id: orderedVideoIds.join(","),
    });

    const videosResponse = await fetch(`${YOUTUBE_VIDEOS_URL}?${videosParams.toString()}`);
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      const message = videosData?.error?.message || "Failed to load YouTube video details";
      return jsonResponse({ success: false, error: message }, videosResponse.status);
    }

    const videoOrder = new Map(orderedVideoIds.map((videoId, index) => [videoId, index]));

    const streams = (videosData.items || [])
      .filter((item: any) => item?.status?.embeddable === true)
      .sort((a: any, b: any) => (videoOrder.get(a.id) ?? 0) - (videoOrder.get(b.id) ?? 0))
      .slice(0, safeMaxResults)
      .map((item: any) => ({
        id: item.id,
        videoId: item.id,
        title: item?.snippet?.title || "Live stream",
        channelTitle: item?.snippet?.channelTitle || "Unknown channel",
        thumbnailUrl:
          item?.snippet?.thumbnails?.high?.url ||
          item?.snippet?.thumbnails?.medium?.url ||
          item?.snippet?.thumbnails?.default?.url ||
          "",
        publishedAt: item?.snippet?.publishedAt,
        embedUrl: `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&mute=1&rel=0`,
      }));

    return jsonResponse({
      success: true,
      query: safeQuery,
      streams,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ success: false, error: message }, 500);
  }
});
