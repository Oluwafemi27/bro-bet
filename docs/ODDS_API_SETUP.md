# Odds API Configuration Guide

## Overview
The application uses The Odds API (https://the-odds-api.com/) to fetch sports data and odds. This API requires proper configuration to function.

## Problem Fixed
The previous implementation had:
- ❌ API key exposed in client-side code (security risk)
- ❌ Direct browser requests causing CORS errors
- ❌ No error handling or fallback

## Solution Implemented
- ✅ Created a Supabase Edge Function as a backend proxy
- ✅ API key stored securely in environment variables
- ✅ Improved error handling and retry logic
- ✅ Better timeout and failure handling

## Setup Instructions

### 1. Get The Odds API Key
1. Sign up at https://the-odds-api.com/
2. Create an account and get your API key
3. Your free tier includes 500 requests per month

### 2. Configure Supabase Environment Variable

Set the environment variable in your Supabase project:

**Via Supabase Dashboard:**
1. Go to Settings → Edge Functions → Environment variables
2. Add a new variable:
   - **Key:** `THE_ODDS_API_KEY`
   - **Value:** Your actual API key from The Odds API

**Via Supabase CLI:**
```bash
supabase secrets set THE_ODDS_API_KEY=your_actual_api_key
```

### 3. Deploy the Edge Function

```bash
# Deploy the odds-api edge function
supabase functions deploy odds-api
```

Verify deployment:
```bash
supabase functions list
```

You should see `odds-api` in the list with status "ACTIVE".

## How It Works

```
Browser App
    ↓
useOddsApi hook
    ↓
Edge Function: /functions/v1/odds-api
    ↓
The Odds API (with secret key)
    ↓
Backend returns data to browser
```

## Error Handling

The system now includes:
- **Automatic retries:** Up to 2 retries with exponential backoff
- **Timeout protection:** 15-second timeout per request
- **Fallback data:** Returns empty array on failure instead of crashing
- **Detailed logging:** Console logs for debugging

## Testing

After setup, you should see:
- ✅ Sports list loading in the app
- ✅ Odds and fixtures appearing correctly
- ✅ No CORS errors in browser console
- ✅ No exposed API keys

## Troubleshooting

### "API key not configured" error
- Verify the environment variable is set in Supabase
- Redeploy the edge function after setting the variable

### Request timeout
- The API may be slow. Timeout is set to 15 seconds
- Check your internet connection

### Still getting fetch errors
- Check Supabase edge function logs: `supabase functions logs odds-api`
- Verify your API key is valid and has requests remaining
- Check The Odds API dashboard for usage

## API Endpoints Used

The system fetches from these endpoints:
- `GET /sports` - List all available sports
- `GET /sports/{sport}/odds` - Get odds for a specific sport

Example request via proxy:
```
/functions/v1/odds-api?path=/sports?all=false
/functions/v1/odds-api?path=/sports/soccer_epl/odds?regions=eu&markets=h2h
```

## Environment Variables

**Required:**
- `THE_ODDS_API_KEY` - Your API key from The Odds API

**Already configured:**
- `VITE_SUPABASE_URL` - For browser to access edge functions
- `VITE_SUPABASE_PUBLISHABLE_KEY` - For authentication

## Development vs Production

- **Development:** Deploy edge function locally with `supabase functions serve`
- **Production:** Deploy to your Supabase project with `supabase functions deploy`

## References
- The Odds API Docs: https://the-odds-api.com/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
