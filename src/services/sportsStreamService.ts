import { supabase } from "@/integrations/supabase/client";

export type StreamTopic = "nba" | "boxing";

export interface LiveStreamResult {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt?: string;
  embedUrl: string;
}

export const liveStreamTopics: Array<{ id: StreamTopic; label: string; query: string }> = [
  {
    id: "nba",
    label: "NBA Basketball",
    query: "NBA basketball live",
  },
  {
    id: "boxing",
    label: "Boxing",
    query: "boxing live",
  },
];

const topicQueryMap = liveStreamTopics.reduce<Record<StreamTopic, string>>((acc, topic) => {
  acc[topic.id] = topic.query;
  return acc;
}, {
  nba: "NBA basketball live",
  boxing: "boxing live",
});

export async function fetchLiveStreams(query: string, maxResults = 5): Promise<LiveStreamResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke("get-streams", {
    body: {
      query: trimmedQuery,
      maxResults,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch YouTube live streams");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to fetch YouTube live streams");
  }

  return Array.isArray(data.streams) ? data.streams : [];
}

export function fetchTopicStreams(topic: StreamTopic, maxResults = 5) {
  return fetchLiveStreams(topicQueryMap[topic], maxResults);
}
