"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssistantRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: AssistantRole;
  content: string;
}

interface BlogPostAssistantProps {
  slug: string;
  title: string;
}

interface AssistantResponse {
  answer?: string;
  error?: string;
}

const STARTER_PROMPTS = [
  "Can you summarize the key takeaways from this post?",
  "Explain the toughest concept in plain English.",
  "What mistakes should I avoid based on this article?",
];
const HISTORY_ITEMS_TO_SEND = 8;
const MAX_HISTORY_CONTENT_CHARS = 1800;

const toMessageId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function BlogPostAssistant({ slug, title }: BlogPostAssistantProps) {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const greeting = useMemo(() => {
    return `Ask me anything about "${title}" and I'll explain it in plain language, summarize sections, or unpack tricky concepts.`;
  }, [title]);

  const recentHistory = useMemo(() => {
    return messages.slice(-HISTORY_ITEMS_TO_SEND).map((message) => ({
      role: message.role,
      content: message.content.slice(0, MAX_HISTORY_CONTENT_CHARS),
    }));
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanQuestion = question.trim();
    if (!cleanQuestion || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: toMessageId(),
      role: "user",
      content: cleanQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/blog-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          message: cleanQuestion,
          userName: name.trim() || undefined,
          history: recentHistory,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as AssistantResponse;

      if (!response.ok || !payload.answer) {
        const serverError =
          payload.error ||
          "I couldn't generate a response right now. Please try again.";
        setError(serverError);
        setMessages((current) =>
          current.filter((message) => message.id !== userMessage.id)
        );
        return;
      }

      const assistantMessage: ChatMessage = {
        id: toMessageId(),
        role: "assistant",
        content: payload.answer,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setError("Network issue while reaching the assistant. Please try again.");
      setMessages((current) =>
        current.filter((message) => message.id !== userMessage.id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="border-t border-border p-6 lg:p-10 space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Ask the Post Assistant
        </h2>
        <p className="text-sm text-muted-foreground">{greeting}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
        <label htmlFor={`assistant-name-${slug}`} className="sr-only">
          Your name
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={`assistant-name-${slug}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name (optional)"
            className="h-10 w-full rounded-md border border-input bg-background px-10 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuestion(prompt)}
              className="text-xs sm:text-sm"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30">
        <div className="max-h-[360px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              Ask a question about this post and I&apos;ll keep it concise,
              practical, and grounded in the article.
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={cn(
                  "max-w-3xl rounded-md px-4 py-3 text-sm whitespace-pre-wrap",
                  message.role === "assistant"
                    ? "bg-card border border-border"
                    : "ml-auto bg-primary text-primary-foreground"
                )}
              >
                <p className="mb-1 text-xs uppercase tracking-wide opacity-75">
                  {message.role === "assistant" ? "Assistant" : "You"}
                </p>
                <p>{message.content}</p>
              </article>
            ))
          )}

          {isLoading && (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking through the post...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-4 space-y-3">
          <label htmlFor={`assistant-message-${slug}`} className="sr-only">
            Ask a question about this post
          </label>
          <textarea
            id={`assistant-message-${slug}`}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about this post..."
            rows={3}
            maxLength={3000}
            disabled={isLoading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none resize-y focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{question.length}/3000</p>
            <Button
              type="submit"
              disabled={isLoading || question.trim().length === 0}
              className="inline-flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Ask assistant
            </Button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      </div>

      <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
        <Bot className="h-3.5 w-3.5" />
        Responses are generated from this article&apos;s content and your specific
        question.
      </p>
    </section>
  );
}
