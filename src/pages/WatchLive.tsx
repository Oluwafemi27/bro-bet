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

  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50; // minimum swipe distance
    const difference = touchStartX.current - touchEndX.current;

    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        scroll('right'); // swiped left, scroll right
      } else {
        scroll('left'); // swiped right, scroll left
      }
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
        <div className="w-full space-y-1.5 sm:space-y-4 py-2 sm:py-4 px-3 sm:px-0 sm:container">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="-ml-2 text-[10px] sm:text-sm h-7 sm:h-9 px-1.5">
            <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Back
          </Button>

          <div className="flex flex-col gap-0.5 sm:gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              {isLive(selected.date) && (
                <Badge className="bg-destructive text-destructive-foreground text-[8px] sm:text-xs w-fit h-4 sm:h-6 py-0 sm:py-1">
                  <Radio className="mr-0.5 h-1 w-1 sm:h-2 sm:w-2" /> LIVE
                </Badge>
              )}
              <h1 className="font-display text-sm sm:text-2xl font-bold line-clamp-2">{selected.title}</h1>
            </div>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{formatTime(selected.date)}</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 sm:p-4 text-center">
                  <Tv className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">
                    No stream yet. Usually appears 30–60 min before kickoff.
                  </p>
                </div>
              )}
            </div>
          </div>

          {sources.length > 1 && (
            <div className="space-y-1">
              <p className="text-[10px] sm:text-sm font-semibold">Stream source</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {sources.map((s, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={i === activeSourceIdx ? "default" : "outline"}
                    onClick={() => setActiveSourceIdx(i)}
                    className="text-[9px] sm:text-sm h-6 sm:h-9 px-2 sm:px-3"
                  >
                    {s.name || s.source || `Source ${i + 1}`}
                    {s.language ? ` · ${s.language}` : ""}
                    {s.quality ? ` · ${s.quality}` : ""}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight">
            Streams by sportsrc.org
          </p>
        </div>
      </Layout>
    );
  }

  // ---- Sport picker + match list ----
  return (
    <Layout>
      <div className="w-full space-y-2 sm:space-y-4 py-2 sm:py-4 px-3 sm:px-0 sm:container">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Tv className="h-4 w-4 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h1 className="font-display text-base sm:text-2xl font-bold">Watch Live</h1>
        </div>
        <p className="text-[11px] sm:text-sm text-muted-foreground leading-tight">
          Pick a sport to stream matches.
        </p>

        {/* Sport tabs with slide navigation */}
        <div className="relative -mx-3 sm:mx-0 px-3 sm:px-0">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-background to-transparent p-1 sm:p-2 text-primary hover:text-primary/80"
              aria-label="Scroll sports left"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
          )}
          <div
            ref={sportsScrollRef}
            className="flex gap-1 sm:gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {sports.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={s.id === category ? "default" : "outline"}
                className="shrink-0 text-[10px] sm:text-sm h-7 sm:h-9 px-2.5 sm:px-3 whitespace-nowrap font-medium"
                onClick={() => setCategory(s.id)}
              >
                {s.name}
              </Button>
            ))}
          </div>
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-l from-background to-transparent p-1 sm:p-2 text-primary hover:text-primary/80"
              aria-label="Scroll sports right"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>

        {/* Matches */}
        {loadingMatches ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-8 text-center">
            <Tv className="mx-auto mb-2 sm:mb-3 h-7 w-7 sm:h-10 sm:w-10 text-muted-foreground" />
            <p className="text-[11px] sm:text-sm text-muted-foreground">
              No live or upcoming matches found for this sport right now.
            </p>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2">
            {matches.map((m) => {
              const live = isLive(m.date);
              return (
                <button
                  key={m.id}
                  onClick={() => openMatch(m)}
                  className="w-full rounded-lg border border-border bg-card p-2 sm:p-4 text-left transition hover:border-primary/50 hover:bg-card/80 active:bg-card/60"
                >
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      {m.teams?.home?.badge && (
                        <img
                          src={m.teams.home.badge}
                          alt=""
                          loading="lazy"
                          className="h-6 w-6 sm:h-10 sm:w-10 shrink-0 rounded-full bg-muted object-contain"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] sm:text-base font-semibold">{m.title}</p>
                        <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">{formatTime(m.date)}</p>
                      </div>
                      {m.teams?.away?.badge && (
                        <img
                          src={m.teams.away.badge}
                          alt=""
                          loading="lazy"
                          className="h-6 w-6 sm:h-10 sm:w-10 shrink-0 rounded-full bg-muted object-contain"
                        />
                      )}
                    </div>
                    {live && (
                      <div className="flex justify-end">
                        <Badge className="bg-destructive text-destructive-foreground text-[8px] sm:text-xs h-4 sm:h-6 py-0 sm:py-1">
                          <Radio className="mr-0.5 h-1 w-1 sm:h-2 sm:w-2" /> LIVE
                        </Badge>
                      </div>
                    )}
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
