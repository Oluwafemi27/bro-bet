import { useEffect, useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Tv, Loader2, ArrowLeft, Radio, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Sport {
  id: string;
  name: string;
}

interface Match {
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
}

interface StreamSource {
  source?: string;
  name?: string;
  url?: string;
  embed?: string;
  language?: string;
  quality?: string;
}

interface MatchDetail extends Match {
  sources?: StreamSource[];
}

const SPORT_FALLBACK: Sport[] = [
  { id: "football", name: "Football" },
  { id: "basketball", name: "Basketball" },
  { id: "fight", name: "Fight (UFC, Boxing)" },
  { id: "american-football", name: "American Football" },
  { id: "tennis", name: "Tennis" },
  { id: "cricket", name: "Cricket" },
  { id: "hockey", name: "Hockey" },
  { id: "baseball", name: "Baseball" },
];

const WatchLive = () => {
  const [sports, setSports] = useState<Sport[]>(SPORT_FALLBACK);
  const [category, setCategory] = useState<string>("football");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selected, setSelected] = useState<MatchDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  const sportsScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Load sports list once
  useEffect(() => {
    (async () => {
      const { data } = await supabase.functions.invoke("get-streams", {
        body: null,
        method: "GET" as never,
      }).catch(() => ({ data: null } as { data: null }));
      // invoke doesn't pass query string easily; use direct fetch
      try {
        const url = `https://wfyisqyqlijmaifunhqv.supabase.co/functions/v1/get-streams?action=sports`;
        const r = await fetch(url);
        const j = await r.json();
        if (j?.success && Array.isArray(j.data)) setSports(j.data);
      } catch {
        /* keep fallback */
      }
      setTimeout(checkScroll, 50);
    })();
  }, []);

  useEffect(() => {
    checkScroll();
    const scrollEl = sportsScrollRef.current;
    scrollEl?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      scrollEl?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Load matches when category changes
  useEffect(() => {
    setSelected(null);
    setLoadingMatches(true);
    (async () => {
      try {
        const url = `https://wfyisqyqlijmaifunhqv.supabase.co/functions/v1/get-streams?action=matches&category=${encodeURIComponent(category)}`;
        const r = await fetch(url);
        const j = await r.json();
        setMatches(j?.success && Array.isArray(j.data) ? j.data : []);
      } catch {
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    })();
  }, [category]);

  const openMatch = async (m: Match) => {
    setLoadingDetail(true);
    setActiveSourceIdx(0);
    setSelected({ ...m, sources: [] });
    try {
      const url = `https://wfyisqyqlijmaifunhqv.supabase.co/functions/v1/get-streams?action=detail&category=${encodeURIComponent(category)}&id=${encodeURIComponent(m.id)}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j?.success && j.data) setSelected(j.data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const isLive = (date: number) => {
    const now = Date.now();
    return date <= now && now - date < 4 * 60 * 60 * 1000;
  };

  const checkScroll = () => {
    if (sportsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sportsScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (sportsScrollRef.current) {
      const scrollAmount = 300;
      sportsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 100);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const sameDay = d.toDateString() === today.toDateString();
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `Today ${time}`;
    if (isTomorrow) return `Tomorrow ${time}`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` ${time}`;
  };

  // ---- Detail / player view ----
  if (selected) {
    const sources = selected.sources || [];
    const active = sources[activeSourceIdx];
    const embedUrl = active?.embed || active?.url || "";

    return (
      <Layout>
        <div className="container space-y-3 sm:space-y-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="-ml-2 text-xs sm:text-sm">
            <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Back
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {isLive(selected.date) && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs w-fit">
                <Radio className="mr-1 h-2 w-2 sm:h-3 sm:w-3" /> LIVE
              </Badge>
            )}
            <h1 className="font-display text-lg sm:text-2xl font-bold line-clamp-2">{selected.title}</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{formatTime(selected.date)}</p>

          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-border bg-card">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              {loadingDetail ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : embedUrl ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={selected.title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Tv className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No stream available yet. Streams typically appear 30–60 minutes before kickoff.
                  </p>
                </div>
              )}
            </div>
          </div>

          {sources.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-semibold">Choose stream source</p>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={i === activeSourceIdx ? "default" : "outline"}
                    onClick={() => setActiveSourceIdx(i)}
                    className="text-xs sm:text-sm"
                  >
                    {s.name || s.source || `Source ${i + 1}`}
                    {s.language ? ` · ${s.language}` : ""}
                    {s.quality ? ` · ${s.quality}` : ""}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Streams provided by sportsrc.org. If a stream doesn't load, try another source above.
          </p>
        </div>
      </Layout>
    );
  }

  // ---- Sport picker + match list ----
  return (
    <Layout>
      <div className="container space-y-4 py-4">
        <div className="flex items-center gap-2">
          <Tv className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Watch Live</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Pick a sport, then choose a match to stream right inside the app.
        </p>

        {/* Sport tabs with slide navigation */}
        <div className="relative -mx-4 px-4">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-background to-transparent p-2 text-primary hover:text-primary/80"
              aria-label="Scroll sports left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div
            ref={sportsScrollRef}
            className="flex gap-2 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {sports.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={s.id === category ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setCategory(s.id)}
              >
                {s.name}
              </Button>
            ))}
          </div>
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-l from-background to-transparent p-2 text-primary hover:text-primary/80"
              aria-label="Scroll sports right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Matches */}
        {loadingMatches ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Tv className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No live or upcoming matches found for this sport right now.
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {matches.map((m) => {
              const live = isLive(m.date);
              return (
                <button
                  key={m.id}
                  onClick={() => openMatch(m)}
                  className="w-full rounded-lg sm:rounded-xl border border-border bg-card p-3 sm:p-4 text-left transition hover:border-primary/50 hover:bg-card/80 active:bg-card/60"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {m.teams?.home?.badge && (
                        <img
                          src={m.teams.home.badge}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-muted object-contain"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm sm:text-base font-semibold">{m.title}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{formatTime(m.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      {live && (
                        <Badge className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs">
                          <Radio className="mr-1 h-2 w-2 sm:h-3 sm:w-3" /> LIVE
                        </Badge>
                      )}
                      {m.teams?.away?.badge && (
                        <img
                          src={m.teams.away.badge}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted object-contain"
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WatchLive;
