import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allow unauthenticated requests to this function
const enableCors = (headers: Record<string, string> = {}) => ({
  ...corsHeaders,
  ...headers,
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: enableCors() });
  }

  try {
    // Get API key from environment
    let apiKey = Deno.env.get('THE_ODDS_API_KEY');

    // If not found in env, log it but return empty data to prevent frontend crashes
    if (!apiKey) {
      console.warn('THE_ODDS_API_KEY not found in environment');
      return new Response(
        JSON.stringify([]),
        {
          status: 200,
          headers: enableCors({ 'Content-Type': 'application/json' }),
        }
      );
    }

    // Parse the request body to get the path, or use URL params as fallback
    let path = '/sports?all=false';

    try {
      if (req.method !== 'GET') {
        const body = await req.json();
        if (body.path) {
          path = body.path;
        }
      } else {
        const url = new URL(req.url);
        const urlPath = url.searchParams.get('path');
        if (urlPath) {
          path = urlPath;
        }
      }
    } catch {
      // If body parsing fails, try URL params
      const url = new URL(req.url);
      const urlPath = url.searchParams.get('path');
      if (urlPath) {
        path = urlPath;
      }
    }
    
    const oddsApiUrl = `https://api.the-odds-api.com/v4${path}&apiKey=${apiKey}`;

    console.log('Fetching from Odds API:', oddsApiUrl);

    // Make request to The Odds API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(oddsApiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Odds API returned ${response.status}:`, await response.text());
        // Return empty array instead of error to keep frontend stable
        return new Response(
          JSON.stringify([]),
          {
            status: 200,
            headers: enableCors({ 'Content-Type': 'application/json' }),
          }
        );
      }

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: enableCors({ 'Content-Type': 'application/json' }),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Odds API proxy error:', message);

    // Return empty array on error for resilience
    return new Response(
      JSON.stringify([]),
      {
        status: 200,
        headers: enableCors({ 'Content-Type': 'application/json' }),
      }
    );
  }
});
