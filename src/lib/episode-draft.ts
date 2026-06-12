import { gateway, generateText } from "ai";

import { env } from "@/lib/env";

export async function draftEpisodeRundown({
  brief,
  hosts,
  lengthCap,
  musicVibe,
  source,
  sourceUrl,
}: {
  brief: string;
  hosts: string[];
  lengthCap?: string;
  musicVibe?: string;
  source: string;
  sourceUrl?: string;
}) {
  const content = await fetchSourceContent({ source, sourceUrl });
  const aiDraft = await draftWithGateway({ content, hosts, lengthCap, source });

  if (aiDraft.length >= 3) return aiDraft;

  const lead = content.items[0] ?? content.summary;
  const supporting = content.items.slice(1, 4);

  return [
    `${hosts[0]}: Here is the useful version of ${source}. ${lead}`,
    `${hosts[1]}: The practical read is this: ${content.summary}`,
    `${hosts[0]}: ${supporting[0] ?? brief}`,
    `${hosts[1]}: ${supporting[1] ?? "The signal is what changed, who it affects, and what to watch next."}`,
    `${hosts[0]}: Quick close. Keep this under the ${lengthCap ?? "brief"} cap, with a ${musicVibe ?? "mist"} feel.`,
  ].map(cleanLine);
}

async function draftWithGateway({
  content,
  hosts,
  lengthCap,
  source,
}: {
  content: SourceContent;
  hosts: string[];
  lengthCap?: string;
  source: string;
}) {
  if (!env.AI_GATEWAY_API_KEY) return [];

  try {
    const model = await pickGatewayModel();
    const result = await generateText({
      maxOutputTokens: 420,
      model: gateway(model),
      prompt: `Write a concise two-host audio bulletin from this ${source} material.
Make it natural spoken text, factual, and useful. Return 4-6 lines only, each starting with the speaker name.
Hosts: ${hosts.join(" and ")}.
Length: ${lengthCap ?? "brief"}.

${content.raw}`,
      providerOptions: {
        gateway: {
          cacheControl: "max-age=300",
          tags: ["feature:episode-draft"],
        },
      },
    });
    return result.text
      .split(/\n+/)
      .map((line) => cleanLine(line.replace(/^[-*\d.\s]+/, "")))
      .filter((line) => line.length > 20)
      .slice(0, 6);
  } catch (error) {
    console.error("AI Gateway episode draft failed", error);
    return [];
  }
}

async function pickGatewayModel() {
  const { models } = await gateway.getAvailableModels();
  const ids = models.map((model) => model.id);

  return (
    ids.find((id) => /gpt.*(nano|mini)|mini.*gpt|flash|haiku/i.test(id)) ??
    ids.find((id) => id.startsWith("openai/")) ??
    "openai/gpt-5.4"
  );
}

type SourceContent = {
  items: string[];
  raw: string;
  summary: string;
};

async function fetchSourceContent({
  source,
  sourceUrl,
}: {
  source: string;
  sourceUrl?: string;
}): Promise<SourceContent> {
  if (source.toLowerCase().includes("hacker")) {
    return fetchHackerNews();
  }

  if (sourceUrl) {
    return fetchUrlContent(sourceUrl);
  }

  return {
    items: [],
    raw: source,
    summary: `This episode is based on ${source}.`,
  };
}

async function fetchHackerNews(): Promise<SourceContent> {
  const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
    next: { revalidate: 120 },
  });
  const ids = ((await idsResponse.json()) as number[]).slice(0, 6);
  const stories = await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 120 },
      });
      return (await response.json()) as { descendants?: number; score?: number; title?: string; url?: string };
    }),
  );
  const items = stories
    .filter((story) => story.title)
    .map(
      (story, index) =>
        `${index + 1}. ${story.title}. ${story.score ?? 0} points, ${story.descendants ?? 0} comments.`,
    );

  return {
    items,
    raw: items.join("\n"),
    summary: `The front page is led by ${items.slice(0, 3).join(" ")}`,
  };
}

async function fetchUrlContent(url: string): Promise<SourceContent> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Modulate/0.1 (+https://modulate.news)",
    },
  });
  const html = await response.text();
  const title = matchMeta(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? new URL(url).hostname;
  const description =
    matchMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
    matchMeta(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ??
    "";
  const text = htmlToText(html).slice(0, 5000);
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.slice(0, 4).map(cleanLine) ?? [];

  return {
    items: [title, description, ...sentences].filter(Boolean),
    raw: [title, description, text].filter(Boolean).join("\n\n"),
    summary: description || sentences.slice(0, 2).join(" ") || `A page from ${new URL(url).hostname}.`,
  };
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function matchMeta(html: string, pattern: RegExp) {
  return cleanLine(html.match(pattern)?.[1] ?? "");
}

function cleanLine(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 520);
}
