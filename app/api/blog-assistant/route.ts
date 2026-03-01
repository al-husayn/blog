import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { blogSource } from "@/lib/blog-source";
import { siteConfig } from "@/lib/site";

interface BlogPostData {
  title: string;
  description: string;
  date: string;
  tags?: string[];
}

interface BlogPage {
  url: string;
  data: BlogPostData;
}

interface CloudChatCompletionResponse {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const BLOG_PATH_PREFIX = "/blog/";
const MAX_HISTORY_MESSAGES = 8;
const MAX_ARTICLE_CONTEXT_CHARS = 16000;

// Defaults target an open-source cloud model via OpenRouter.
const DEFAULT_AI_API_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_AI_MODEL = "openrouter/free";
const FALLBACK_AI_MODEL = "openrouter/free";

const requestSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "Invalid slug format"),
  message: z.string().trim().min(1).max(3000),
  userName: z.string().trim().min(1).max(80).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .max(MAX_HISTORY_MESSAGES)
    .optional(),
});

const stripFrontmatter = (content: string): string => {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
};

const normalizeArticleContent = (content: string): string => {
  return stripFrontmatter(content).trim().slice(0, MAX_ARTICLE_CONTEXT_CHARS);
};

const getSlugFromPageUrl = (url: string): string | null => {
  if (!url.startsWith(BLOG_PATH_PREFIX)) {
    return null;
  }

  const slug = url.slice(BLOG_PATH_PREFIX.length).replace(/\/$/, "");
  if (!slug || slug.includes("/")) {
    return null;
  }

  return slug;
};

const getPopularPostsList = (): string => {
  const pages = blogSource.getPages() as BlogPage[];
  const sortedPages = [...pages].sort((a, b) => {
    const aTime = Date.parse(a.data.date) || 0;
    const bTime = Date.parse(b.data.date) || 0;
    return bTime - aTime;
  });

  return sortedPages
    .slice(0, 3)
    .map((page) => `- ${page.data.title} (${page.url})`)
    .join("\n");
};

const getArticleContext = async (
  slug: string
): Promise<{
  title: string;
  description: string;
  tags: string[];
  body: string;
} | null> => {
  const page = blogSource.getPage([slug]) as BlogPage | undefined;
  if (!page) {
    return null;
  }

  const articlePath = path.join(process.cwd(), "blog", "content", `${slug}.mdx`);
  let body = "";

  try {
    const rawContent = await fs.readFile(articlePath, "utf8");
    body = normalizeArticleContent(rawContent);
  } catch {
    body = page.data.description;
  }

  return {
    title: page.data.title,
    description: page.data.description,
    tags: page.data.tags ?? [],
    body,
  };
};

const extractCloudAnswer = (payload: CloudChatCompletionResponse): string => {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item.text === "string" ? item.text.trim() : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
};

const shouldRetryWithFallback = (providerError: string): boolean => {
  const normalized = providerError.toLowerCase();
  return (
    normalized.includes("no endpoints found") ||
    normalized.includes("model not found") ||
    normalized.includes("not available") ||
    normalized.includes("no provider")
  );
};

const requestCloudCompletion = async ({
  apiBaseUrl,
  apiKey,
  model,
  messages,
  referer,
  title,
}: {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  referer: string;
  title: string;
}): Promise<{
  ok: boolean;
  payload: CloudChatCompletionResponse | null;
  providerError: string;
}> => {
  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": referer,
      "X-Title": title,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | CloudChatCompletionResponse
    | null;
  const providerError =
    payload?.error?.message || (response.ok ? "" : "Unknown provider error.");

  return {
    ok: response.ok,
    payload,
    providerError,
  };
};

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing AI_API_KEY. Add a cloud provider API key (for example OpenRouter) to enable the assistant.",
      },
      { status: 500 }
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsedInput = requestSchema.safeParse(rawBody);
  if (!parsedInput.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { slug, message, userName } = parsedInput.data;
  const history = (parsedInput.data.history ?? []).slice(-MAX_HISTORY_MESSAGES);
  const article = await getArticleContext(slug);

  if (!article) {
    const popularPosts = getPopularPostsList();
    return NextResponse.json(
      {
        error: "Post not found.",
        suggestions:
          popularPosts.length > 0
            ? popularPosts
            : "No posts available yet. Please add content to blog/content first.",
      },
      { status: 404 }
    );
  }

  const tagsLine = article.tags.length > 0 ? article.tags.join(", ") : "None listed";
  const allPostSlugs = (blogSource.getPages() as BlogPage[])
    .map((page) => getSlugFromPageUrl(page.url))
    .filter((value): value is string => Boolean(value))
    .join(", ");

  const systemPrompt = `You are an embedded AI assistant for a developer blog called "${siteConfig.name}".

Blog focus:
- Software engineering
- AI and modern developer tooling
- Web development with JavaScript, TypeScript, React, and Next.js

Your role:
- Help readers understand this specific blog post.
- Answer questions, explain concepts, clarify difficult sections, and summarize key points.
- Keep responses concise, clear, and human.

Behavior rules:
- Ground every answer in the article context below. Do not fabricate facts.
- Tailor every response to the specific user and their exact question.
- If the user's name is provided, address them naturally by name.
- Adapt depth to the user's apparent skill level.
- Use a friendly conversational tone, contractions, and plain language.
- Use light humor only when natural and brief.
- For confusing concepts, rephrase and use analogies ("Think of it like...").
- Call out common pitfalls when relevant.
- Keep summaries under 200 words unless the user asks for more detail.
- Use bullets or short numbered steps when it improves clarity.
- If the user asks something unrelated to this post, politely redirect:
  "That's interesting, but let's tie it back to this post. How does it relate?"
- End with an inviting follow-up question.

Current article:
- Slug: ${slug}
- Title: ${article.title}
- Description: ${article.description}
- Tags: ${tagsLine}

Allowed article slugs in this blog:
${allPostSlugs || "(none found)"}

Article content:
"""
${article.body}
"""

If the user asks about a different post and needs options, suggest popular posts:
${getPopularPostsList() || "- No popular posts available yet"}`;

  const userPrompt = `User name: ${userName ?? "Not provided"}
User question: ${message}`;

  const aiApiBaseUrl = (
    process.env.AI_API_BASE_URL || DEFAULT_AI_API_BASE_URL
  ).replace(/\/$/, "");
  const model = process.env.AI_MODEL || DEFAULT_AI_MODEL;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user",
      content: userPrompt,
    },
  ];

  try {
    const referer = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
    const title = siteConfig.shortName || siteConfig.name;

    let completion = await requestCloudCompletion({
      apiBaseUrl: aiApiBaseUrl,
      apiKey,
      model,
      messages,
      referer,
      title,
    });

    if (!completion.ok && shouldRetryWithFallback(completion.providerError) && model !== FALLBACK_AI_MODEL) {
      completion = await requestCloudCompletion({
        apiBaseUrl: aiApiBaseUrl,
        apiKey,
        model: FALLBACK_AI_MODEL,
        messages,
        referer,
        title,
      });
    }

    if (!completion.ok) {
      console.error("Blog assistant cloud upstream error:", completion.providerError);
      return NextResponse.json(
        { error: `Assistant backend failed: ${completion.providerError}` },
        { status: 502 }
      );
    }

    if (!completion.payload) {
      return NextResponse.json(
        { error: "Assistant backend returned an invalid response payload." },
        { status: 502 }
      );
    }

    const answer = extractCloudAnswer(completion.payload);
    if (!answer) {
      return NextResponse.json(
        { error: "Assistant returned an empty response. Please retry." },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Blog assistant cloud connection error:", error);
    return NextResponse.json(
      {
        error:
          "Could not reach the cloud model endpoint. Verify AI_API_BASE_URL and network access.",
      },
      { status: 502 }
    );
  }
}
