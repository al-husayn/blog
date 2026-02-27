"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronUp, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Reaction = "like" | "dislike";

interface CommentItem {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  upvotes: number;
}

interface EngagementState {
  likes: number;
  dislikes: number;
  articleUpvotes: number;
  userReaction: Reaction | null;
  userUpvotedArticle: boolean;
  comments: CommentItem[];
  upvotedCommentIds: string[];
}

interface ArticleEngagementProps {
  slug: string;
}

const createInitialState = (): EngagementState => ({
  likes: 0,
  dislikes: 0,
  articleUpvotes: 0,
  userReaction: null,
  userUpvotedArticle: false,
  comments: [],
  upvotedCommentIds: [],
});

const toNonNegativeNumber = (value: unknown): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
};

const sanitizeComments = (value: unknown): CommentItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => {
      return typeof item === "object" && item !== null;
    })
    .map((comment) => ({
      id:
        typeof comment.id === "string"
          ? comment.id
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author:
        typeof comment.author === "string" && comment.author.trim().length > 0
          ? comment.author.trim()
          : "Anonymous",
      message:
        typeof comment.message === "string" ? comment.message.trim() : "",
      createdAt:
        typeof comment.createdAt === "string"
          ? comment.createdAt
          : new Date().toISOString(),
      upvotes: toNonNegativeNumber(comment.upvotes),
    }))
    .filter((comment) => comment.message.length > 0);
};

const sanitizeState = (value: unknown): EngagementState => {
  const fallback = createInitialState();

  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const candidate = value as Partial<EngagementState>;
  const userReaction =
    candidate.userReaction === "like" || candidate.userReaction === "dislike"
      ? candidate.userReaction
      : null;

  const upvotedCommentIds = Array.isArray(candidate.upvotedCommentIds)
    ? candidate.upvotedCommentIds.filter((id): id is string => typeof id === "string")
    : [];

  return {
    likes: toNonNegativeNumber(candidate.likes),
    dislikes: toNonNegativeNumber(candidate.dislikes),
    articleUpvotes: toNonNegativeNumber(candidate.articleUpvotes),
    userReaction,
    userUpvotedArticle: Boolean(candidate.userUpvotedArticle),
    comments: sanitizeComments(candidate.comments),
    upvotedCommentIds,
  };
};

const formatCommentDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ArticleEngagement({ slug }: ArticleEngagementProps) {
  const storageKey = useMemo(() => `blog:engagement:${slug}`, [slug]);
  const [state, setState] = useState<EngagementState>(createInitialState);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue);
      setState(sanitizeState(parsedValue));
    } catch {
      setState(createInitialState());
    } finally {
      setHasLoadedStorage(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hasLoadedStorage, state, storageKey]);

  const handleReaction = (nextReaction: Reaction) => {
    setState((previousState) => {
      let likes = previousState.likes;
      let dislikes = previousState.dislikes;
      let userReaction = previousState.userReaction;

      if (previousState.userReaction === nextReaction) {
        if (nextReaction === "like") {
          likes = Math.max(0, likes - 1);
        } else {
          dislikes = Math.max(0, dislikes - 1);
        }
        userReaction = null;
      } else {
        if (previousState.userReaction === "like") {
          likes = Math.max(0, likes - 1);
        }
        if (previousState.userReaction === "dislike") {
          dislikes = Math.max(0, dislikes - 1);
        }

        if (nextReaction === "like") {
          likes += 1;
        } else {
          dislikes += 1;
        }
        userReaction = nextReaction;
      }

      return {
        ...previousState,
        likes,
        dislikes,
        userReaction,
      };
    });
  };

  const handleArticleUpvote = () => {
    setState((previousState) => {
      const shouldRemoveVote = previousState.userUpvotedArticle;

      return {
        ...previousState,
        articleUpvotes: shouldRemoveVote
          ? Math.max(0, previousState.articleUpvotes - 1)
          : previousState.articleUpvotes + 1,
        userUpvotedArticle: !shouldRemoveVote,
      };
    });
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setError("Write a comment before posting.");
      return;
    }

    if (cleanMessage.length > 800) {
      setError("Comment is too long. Keep it under 800 characters.");
      return;
    }

    setError(null);

    const cleanAuthor = author.trim() || "Anonymous";
    const newComment: CommentItem = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author: cleanAuthor,
      message: cleanMessage,
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    setState((previousState) => ({
      ...previousState,
      comments: [newComment, ...previousState.comments],
    }));
    setMessage("");
  };

  const handleCommentUpvote = (commentId: string) => {
    setState((previousState) => {
      const hasUpvoted = previousState.upvotedCommentIds.includes(commentId);

      return {
        ...previousState,
        comments: previousState.comments.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          return {
            ...comment,
            upvotes: hasUpvoted
              ? Math.max(0, comment.upvotes - 1)
              : comment.upvotes + 1,
          };
        }),
        upvotedCommentIds: hasUpvoted
          ? previousState.upvotedCommentIds.filter((id) => id !== commentId)
          : [...previousState.upvotedCommentIds, commentId],
      };
    });
  };

  return (
    <section className="border-t border-border p-6 lg:p-10 space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium">Join the conversation</h2>
        <p className="text-sm text-muted-foreground">
          Share your thoughts, react to this post, and upvote helpful comments.
        </p>
        <p className="text-xs text-muted-foreground">
          Reactions and comments are stored only in your browser on this device.
          They are not published publicly and will not sync across devices.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={state.userReaction === "like" ? "default" : "outline"}
          size="sm"
          aria-pressed={state.userReaction === "like"}
          onClick={() => handleReaction("like")}
          className="min-w-[110px] justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Like
          </span>
          <span className="tabular-nums">{state.likes}</span>
        </Button>

        <Button
          type="button"
          variant={state.userReaction === "dislike" ? "default" : "outline"}
          size="sm"
          aria-pressed={state.userReaction === "dislike"}
          onClick={() => handleReaction("dislike")}
          className="min-w-[110px] justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <ThumbsDown className="h-4 w-4" />
            Dislike
          </span>
          <span className="tabular-nums">{state.dislikes}</span>
        </Button>

        <Button
          type="button"
          variant={state.userUpvotedArticle ? "default" : "outline"}
          size="sm"
          aria-pressed={state.userUpvotedArticle}
          onClick={handleArticleUpvote}
          className="min-w-[110px] justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <ChevronUp className="h-4 w-4" />
            Upvote
          </span>
          <span className="tabular-nums">{state.articleUpvotes}</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmitComment}
          className="space-y-4 rounded-lg border border-border bg-muted/30 p-4"
        >
          <h3 className="text-lg font-medium">Leave a comment</h3>

          <div className="space-y-2">
            <label htmlFor={`comment-author-${slug}`} className="text-sm font-medium">
              Name
            </label>
            <input
              id={`comment-author-${slug}`}
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Anonymous"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={`comment-message-${slug}`} className="text-sm font-medium">
              Comment
            </label>
            <textarea
              id={`comment-message-${slug}`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What did you think about this post?"
              rows={5}
              maxLength={800}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y min-h-[120px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {message.length}/800 characters
              </p>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Post comment
          </Button>
          <p className="text-xs text-muted-foreground">
            Local-only draft: this comment will remain on this device.
          </p>
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-medium inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({state.comments.length})
          </h3>

          {state.comments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No comments yet. Be the first to share feedback.
            </div>
          ) : (
            <div className="space-y-3">
              {state.comments.map((comment) => {
                const hasUpvoted = state.upvotedCommentIds.includes(comment.id);

                return (
                  <article
                    key={comment.id}
                    className={cn(
                      "rounded-lg border border-border bg-card p-4 space-y-3",
                      hasUpvoted && "border-primary/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{comment.author}</p>
                        <time className="text-xs text-muted-foreground">
                          {formatCommentDate(comment.createdAt)}
                        </time>
                      </div>
                      <Button
                        type="button"
                        variant={hasUpvoted ? "default" : "outline"}
                        size="sm"
                        aria-pressed={hasUpvoted}
                        onClick={() => handleCommentUpvote(comment.id)}
                      >
                        <ChevronUp className="h-4 w-4" />
                        Upvote
                        <span className="tabular-nums">{comment.upvotes}</span>
                      </Button>
                    </div>

                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.message}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
