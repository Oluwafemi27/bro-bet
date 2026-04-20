import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlayCircle, Radio, RefreshCw, Tv } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchTopicStreams,
  liveStreamTopics,
  type LiveStreamResult,
  type StreamTopic,
} from "@/services/sportsStreamService";

const TOPIC_IDS = liveStreamTopics.map((topic) => topic.id) as StreamTopic[];

const createTopicState = <T,>(initialValue: T): Record<StreamTopic, T> => ({
  nba: initialValue,
  soccer: initialValue,
  boxing: initialValue,
});

const WatchLive = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState<StreamTopic>("nba");
  const [streamsByTopic, setStreamsByTopic] = useState<Record<StreamTopic, LiveStreamResult[]>>(
    createTopicState<LiveStreamResult[]>([]),
  );
  const [selectedByTopic, setSelectedByTopic] = useState<Record<StreamTopic, LiveStreamResult | null>>(
    createTopicState<LiveStreamResult | null>(null),
  );
  const [loadingByTopic, setLoadingByTopic] = useState<Record<StreamTopic, boolean>>(
    createTopicState(false),
  );
  const [errorByTopic, setErrorByTopic] = useState<Record<StreamTopic, string | null>>(
    createTopicState<string | null>(null),
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const loadStreams = useCallback(async (topic: StreamTopic) => {
    setLoadingByTopic((prev) => ({ ...prev, [topic]: true }));
    setErrorByTopic((prev) => ({ ...prev, [topic]: null }));

    try {
      const streams = await fetchTopicStreams(topic, 5);

      setStreamsByTopic((prev) => ({
        ...prev,
        [topic]: streams,
      }));

      setSelectedByTopic((prev) => {
        const currentSelection = prev[topic];
        const nextSelection = currentSelection && streams.some((stream) => stream.videoId === currentSelection.videoId)
          ? streams.find((stream) => stream.videoId === currentSelection.videoId) ?? streams[0] ?? null
          : streams[0] ?? null;

        return {
          ...prev,
          [topic]: nextSelection,
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load live streams right now.";

      setStreamsByTopic((prev) => ({ ...prev, [topic]: [] }));
      setSelectedByTopic((prev) => ({ ...prev, [topic]: null }));
      setErrorByTopic((prev) => ({ ...prev, [topic]: message }));
    } finally {
      setLoadingByTopic((prev) => ({ ...prev, [topic]: false }));
    }
  }, []);

  useEffect(() => {
    TOPIC_IDS.forEach((topic) => {
      void loadStreams(topic);
    });
  }, [loadStreams]);

  const renderTopicContent = (topic: StreamTopic) => {
    const streams = streamsByTopic[topic];
    const selected = selectedByTopic[topic];
    const isLoading = loadingByTopic[topic];
    const error = errorByTopic[topic];

    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-black">
              {selected ? (
                <iframe
                  key={selected.videoId}
                  src={selected.embedUrl}
                  title={selected.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
                  <Tv className="h-10 w-10" />
                  <p className="text-sm">No embeddable live streams found right now.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="line-clamp-2 text-base sm:text-lg">
                  {selected?.title || "Select a live stream"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected?.channelTitle || "Top 5 YouTube live results"}
                </p>
              </div>
              {selected && (
                <Badge className="shrink-0 bg-destructive text-destructive-foreground">
                  <Radio className="mr-1 h-3 w-3" /> LIVE
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Top 5 live streams</h2>
            <p className="text-xs text-muted-foreground">Only embeddable YouTube streams are shown.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadStreams(topic)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        {isLoading && streams.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <CardContent className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : streams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((stream) => {
              const isSelected = selected?.videoId === stream.videoId;

              return (
                <button
                  key={stream.videoId}
                  type="button"
                  onClick={() => setSelectedByTopic((prev) => ({ ...prev, [topic]: stream }))}
                  className="text-left"
                >
                  <Card className={`overflow-hidden transition ${isSelected ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}>
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={stream.thumbnailUrl}
                        alt={stream.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent px-3 py-2 text-white">
                        <Badge className="bg-destructive text-destructive-foreground">
                          <Radio className="mr-1 h-3 w-3" /> LIVE
                        </Badge>
                        <PlayCircle className="h-5 w-5" />
                      </div>
                    </div>
                    <CardContent className="space-y-1 p-4">
                      <p className="line-clamp-2 text-sm font-semibold">{stream.title}</p>
                      <p className="text-xs text-muted-foreground">{stream.channelTitle}</p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        ) : !error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <Tv className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No live streams available</p>
                <p className="text-xs text-muted-foreground">Try refreshing to fetch the latest YouTube results.</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="min-h-screen w-full px-4 py-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Watch Live</h1>
            <p className="text-sm text-muted-foreground">
              Browse embeddable YouTube live streams for NBA basketball and boxing.
            </p>
          </div>
        </div>

        <Tabs value={activeTopic} onValueChange={(value) => setActiveTopic(value as StreamTopic)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            {liveStreamTopics.map((topic) => (
              <TabsTrigger key={topic.id} value={topic.id}>
                {topic.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {liveStreamTopics.map((topic) => (
            <TabsContent key={topic.id} value={topic.id} className="mt-0">
              {renderTopicContent(topic.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default WatchLive;
