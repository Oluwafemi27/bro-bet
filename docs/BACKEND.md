# NaijaBet — Backend Documentation

This document describes the full backend setup for NaijaBet (Lovable Cloud / Supabase): database schema, RLS policies, database functions, triggers, edge functions, and all secrets.

> Note: The actual SQL was applied via Lovable Cloud migrations. This file is a reference snapshot — re-running these statements on a fresh project would reproduce the backend.

---

## 1. Secrets (Edge Function environment variables)

| Name | Purpose |
|------|---------|
| `THE_ODDS_API_KEY` | The Odds API — football odds (decimal, ~10s refresh) |
| `RAPIDAPI_KEY` | API-Football (RapidAPI) — fixtures, standings |
| `BALLDONTLIE_API_KEY` | balldontlie.io — NBA games & teams |
| `PAYSTACK_PUBLIC_KEY` | Paystack test public key for deposits |
| `LOVABLE_API_KEY` | Lovable AI Gateway (reserved for AI features) |
| `SUPABASE_URL` | Auto-injected |
| `SUPABASE_ANON_KEY` | Auto-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected |
| `SUPABASE_DB_URL` | Auto-injected |
| `SUPABASE_PUBLISHABLE_KEY` | Auto-injected |

TheSportsDB uses the public test key `123` and is called directly from edge functions (no secret needed).
sportsrc.org and ESPN scoreboard endpoints are public (no key).

---

## 2. Database Schema

### 2.1 Enum: `app_role`

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### 2.2 Table: `profiles`

User profile, auto-created on signup via trigger.

```sql
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY,                       -- == auth.users.id
  full_name     text NOT NULL DEFAULT '',
  email         text,
  phone         text,
  balance       numeric NOT NULL DEFAULT 0,             -- real money balance
  bonus_balance numeric NOT NULL DEFAULT 500,           -- ₦500 signup bonus
  referral_code text DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2.3 Table: `user_roles`

Roles are stored separately from `profiles` to prevent privilege escalation.

```sql
CREATE TABLE public.user_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role    public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### 2.4 Table: `bets`

```sql
CREATE TABLE public.bets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  selections    jsonb NOT NULL DEFAULT '[]'::jsonb,    -- array of bet selections
  stake         numeric NOT NULL,
  potential_win numeric NOT NULL,
  status        text NOT NULL DEFAULT 'pending',       -- pending|won|lost|void
  booking_code  text DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
```

### 2.5 Table: `transactions`

```sql
CREATE TABLE public.transactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  type       text NOT NULL,                            -- deposit|withdrawal|bet|win|bonus
  amount     numeric NOT NULL,
  status     text NOT NULL DEFAULT 'pending',          -- pending|success|failed
  reference  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
```

### 2.6 Table: `promotions`

```sql
CREATE TABLE public.promotions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  image_url   text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
```

---

## 3. Database Functions

### 3.1 `has_role(_user_id, _role)` — security definer role check

Used by RLS policies to avoid recursion when reading `user_roles`.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### 3.2 `handle_new_user()` — auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;
```

### 3.3 `update_updated_at_column()` — generic timestamp trigger

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## 4. Triggers

```sql
-- Auto-create profile when a new auth user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Keep profiles.updated_at fresh
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 5. Row-Level Security (RLS) Policies

### 5.1 `profiles`

```sql
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
```

### 5.2 `user_roles`

```sql
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);
```

> Insert/update/delete on `user_roles` is intentionally restricted — roles must be assigned via secure server-side flows only.

### 5.3 `bets`

```sql
CREATE POLICY "Users can view own bets"
  ON public.bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
  ON public.bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bets"
  ON public.bets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
```

### 5.4 `transactions`

```sql
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
```

### 5.5 `promotions`

```sql
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
```

---

## 6. Edge Functions

All edge functions live in `supabase/functions/<name>/index.ts` and are deployed automatically.
Each is configured in `supabase/config.toml` with `verify_jwt = false` (they are public, read-only proxies that hide third-party API keys).

### 6.1 `get-api-keys`

Returns a curated set of **publishable** keys (e.g. Paystack public key) so the frontend can initialize SDKs without bundling secrets.

```toml
[functions.get-api-keys]
verify_jwt = false
```

### 6.2 `get-fixtures` — Football odds + fixtures

- **Source:** `https://api.the-odds-api.com/v4/sports/{sport}/odds` using `THE_ODDS_API_KEY`
- Returns football matches with decimal odds (h2h market)
- Filters out finished games (`commence_time` must be live or in the future)
- Cached client-side; auto-refreshes every 10s for live tab

### 6.3 `get-basketball` — NBA games

- **Sources:** `balldontlie.io` (`BALLDONTLIE_API_KEY`) + ESPN scoreboard (no key)
- Combines schedule + live scores
- Filters out finished games using ISO timestamps (status strings like "Qtr 2" indicate live)

### 6.4 `get-boxing` — Boxing fights

- **Source:** TheSportsDB (`https://www.thesportsdb.com/api/v1/json/123/...`), league ID `4445`
- Calls `eventsnextleague.php` and `eventsseason.php` for seasons 2026/2027
- Returns up to 40 events: live now or upcoming (within 90 days), excludes finished
- Parses fighter names from `strEvent` ("Fighter A vs Fighter B") when team fields are absent

### 6.5 `get-streams` — Live stream embeds (sportsrc.org proxy)

Proxies `https://api.sportsrc.org/` and adds CORS + filtering.

| Query param | Values | Description |
|-------------|--------|-------------|
| `action`    | `sports` \| `matches` \| `detail` | Endpoint selector |
| `category`  | `football`, `basketball`, `fight`, `tennis`, `cricket`, `american-football`, `hockey`, `baseball`, etc. | Sport id |
| `id`        | match id | Required for `action=detail` |

Examples:
```
GET /functions/v1/get-streams?action=sports
GET /functions/v1/get-streams?action=matches&category=basketball
GET /functions/v1/get-streams?action=detail&category=football&id=<match-id>
```

For `action=matches`, finished games (started > 4h ago) are filtered out and results are sorted by kickoff time ascending. The `detail` response includes a `sources[]` array of stream embeds — each item has `name`, `embed`/`url`, and may include `language` and `quality`. Sources typically appear ~30–60 minutes before kickoff.

```toml
[functions.get-streams]
verify_jwt = false
```

### 6.6 Standard CORS pattern (used by every function)

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

---

## 7. Authentication

- Email/password signup + login (Supabase Auth).
- `handle_new_user()` trigger auto-creates the profile row with the ₦500 welcome bonus.
- Email confirmation: **disabled** in development for fast iteration. Re-enable in production via Auth settings.
- Roles: assign admin manually with
  ```sql
  INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid>', 'admin');
  ```

---

## 8. Third-Party Data Sources Summary

| Sport / Feature | Provider | Key needed | Endpoint pattern |
|-----------------|----------|-----------|------------------|
| Football odds   | The Odds API | `THE_ODDS_API_KEY` | `/v4/sports/{sport}/odds` |
| Football fixtures | API-Football (RapidAPI) | `RAPIDAPI_KEY` | `/v3/fixtures` |
| Basketball games | balldontlie.io | `BALLDONTLIE_API_KEY` | `/v1/games` |
| Basketball live scores | ESPN | none | `/apis/site/v2/sports/basketball/nba/scoreboard` |
| Boxing events | TheSportsDB | none (public `123`) | `/api/v1/json/123/eventsnextleague.php?id=4445` |
| Team logos / badges | TheSportsDB | none | `/api/v1/json/123/searchteams.php?t=...` |
| Live stream embeds | sportsrc.org | none | `https://api.sportsrc.org/?data=...` |
| Payments | Paystack (test) | `PAYSTACK_PUBLIC_KEY` | Paystack JS SDK |

---

## 9. Filtering Rule (Live + Upcoming Only)

Every match list — football, basketball, boxing, and streams — applies the same filter:

```ts
const liveWindow = 4 * 60 * 60 * 1000; // 4 hours
events.filter(e => e.startTimestamp > Date.now() - liveWindow);
```

This guarantees finished games never appear on any page of the app.
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
