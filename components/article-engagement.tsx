"use client";

import {
    SignInButton,
    UserButton,
    useAuth,
    useClerk,
} from '@clerk/nextjs';
import { ChevronUp, Loader2, MessageSquare } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    ArticleEngagementProps,
    CommentItem,
    CreateCommentResponse,
    EngagementResponse,
    EngagementState,
    ToggleArticleUpvoteResponse,
    ToggleCommentUpvoteResponse,
} from '@/types/components/article-engagement';

const createInitialState = (): EngagementState => ({
    articleUpvotes: 0,
    userUpvotedArticle: false,
    comments: [],
    upvotedCommentIds: [],
});

const isClerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const formatCommentDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Just now';
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getAuthorInitials = (authorName: string): string =>
    authorName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'CM';

const parseResponse = async <T,>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            payload && typeof payload.error === 'string'
                ? payload.error
                : 'Request failed. Please try again.',
        );
    }

    return payload as T;
};

export function ArticleEngagement({ slug }: ArticleEngagementProps) {
    if (!isClerkEnabled) {
        return (
            <section className='space-y-4 border-t border-border p-6 lg:p-10'>
                <div className='space-y-1'>
                    <h2 className='text-2xl font-medium'>Join the conversation</h2>
                    <p className='text-sm text-muted-foreground'>
                        Comments and synced upvotes now use Clerk, Neon, and Drizzle.
                    </p>
                </div>
                <div className='rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground'>
                    Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>,{' '}
                    <code>CLERK_SECRET_KEY</code>, and <code>DATABASE_URL</code> to enable the
                    live engagement system.
                </div>
            </section>
        );
    }

    return <ConfiguredArticleEngagement slug={slug} />;
}

function ConfiguredArticleEngagement({ slug }: ArticleEngagementProps) {
    const { isLoaded, isSignedIn } = useAuth();
    const { openSignIn } = useClerk();
    const [state, setState] = useState<EngagementState>(createInitialState);
    const [message, setMessage] = useState('');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isTogglingArticleUpvote, setIsTogglingArticleUpvote] = useState(false);
    const [pendingCommentIds, setPendingCommentIds] = useState<string[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const controller = new AbortController();
        let didCancel = false;

        const loadEngagement = async () => {
            setIsRefreshing(true);
            setLoadError(null);

            try {
                const response = await fetch(`/api/engagement/${slug}`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });
                const payload = await parseResponse<EngagementResponse>(response);

                if (!didCancel) {
                    setState({
                        articleUpvotes: payload.articleUpvotes,
                        userUpvotedArticle: payload.userUpvotedArticle,
                        comments: payload.comments,
                        upvotedCommentIds: payload.upvotedCommentIds,
                    });
                }
            } catch (error) {
                if (!didCancel && !controller.signal.aborted) {
                    setLoadError(getErrorMessage(error));
                }
            } finally {
                if (!didCancel) {
                    setIsRefreshing(false);
                    setHasFetched(true);
                }
            }
        };

        void loadEngagement();

        return () => {
            didCancel = true;
            controller.abort();
        };
    }, [isLoaded, isSignedIn, refreshKey, slug]);

    const openSignInModal = (messageText: string) => {
        setFormError(messageText);
        void openSignIn();
    };

    const handleArticleUpvote = async () => {
        if (!isSignedIn) {
            openSignInModal('Sign in to upvote this post.');
            return;
        }

        setLoadError(null);

        const previousArticleUpvotes = state.articleUpvotes;
        const previousUserUpvoted = state.userUpvotedArticle;
        const nextUserUpvoted = !previousUserUpvoted;

        setState((previousState) => ({
            ...previousState,
            articleUpvotes: nextUserUpvoted
                ? previousState.articleUpvotes + 1
                : Math.max(0, previousState.articleUpvotes - 1),
            userUpvotedArticle: nextUserUpvoted,
        }));
        setIsTogglingArticleUpvote(true);

        try {
            const response = await fetch(`/api/engagement/${slug}/article-upvotes`, {
                method: 'POST',
            });
            const payload = await parseResponse<ToggleArticleUpvoteResponse>(response);

            setState((previousState) => ({
                ...previousState,
                articleUpvotes: payload.articleUpvotes,
                userUpvotedArticle: payload.userUpvotedArticle,
            }));
        } catch (error) {
            setState((previousState) => ({
                ...previousState,
                articleUpvotes: previousArticleUpvotes,
                userUpvotedArticle: previousUserUpvoted,
            }));
            setLoadError(getErrorMessage(error));
        } finally {
            setIsTogglingArticleUpvote(false);
        }
    };

    const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isSignedIn) {
            openSignInModal('Sign in to post a comment.');
            return;
        }

        const cleanMessage = message.trim();

        if (!cleanMessage) {
            setFormError('Write a comment before posting.');
            return;
        }

        if (cleanMessage.length > 800) {
            setFormError('Comment is too long. Keep it under 800 characters.');
            return;
        }

        setFormError(null);
        setIsSubmittingComment(true);

        try {
            const response = await fetch(`/api/engagement/${slug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: cleanMessage }),
            });
            const payload = await parseResponse<CreateCommentResponse>(response);

            setState((previousState) => ({
                ...previousState,
                comments: [payload.comment, ...previousState.comments],
            }));
            setMessage('');
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentUpvote = async (commentId: string) => {
        if (!isSignedIn) {
            openSignInModal('Sign in to upvote comments.');
            return;
        }

        const hasUpvoted = state.upvotedCommentIds.includes(commentId);
        const previousComment = state.comments.find((comment) => comment.id === commentId);

        if (!previousComment) {
            return;
        }

        setLoadError(null);
        setPendingCommentIds((currentIds) =>
            currentIds.includes(commentId) ? currentIds : [...currentIds, commentId],
        );
        setState((previousState) => ({
            ...previousState,
            comments: previousState.comments.map((comment) =>
                comment.id === commentId
                    ? {
                          ...comment,
                          upvotes: hasUpvoted
                              ? Math.max(0, comment.upvotes - 1)
                              : comment.upvotes + 1,
                      }
                    : comment,
            ),
            upvotedCommentIds: hasUpvoted
                ? previousState.upvotedCommentIds.filter((id) => id !== commentId)
                : [...previousState.upvotedCommentIds, commentId],
        }));

        try {
            const response = await fetch(`/api/engagement/comments/${commentId}/upvote`, {
                method: 'POST',
            });
            const payload = await parseResponse<ToggleCommentUpvoteResponse>(response);

            setState((previousState) => ({
                ...previousState,
                comments: previousState.comments.map((comment) =>
                    comment.id === commentId ? { ...comment, upvotes: payload.upvotes } : comment,
                ),
                upvotedCommentIds: payload.userUpvoted
                    ? [...new Set([...previousState.upvotedCommentIds, commentId])]
                    : previousState.upvotedCommentIds.filter((id) => id !== commentId),
            }));
        } catch (error) {
            setState((previousState) => ({
                ...previousState,
                comments: previousState.comments.map((comment) =>
                    comment.id === commentId
                        ? { ...comment, upvotes: previousComment.upvotes }
                        : comment,
                ),
                upvotedCommentIds: hasUpvoted
                    ? [...new Set([...previousState.upvotedCommentIds, commentId])]
                    : previousState.upvotedCommentIds.filter((id) => id !== commentId),
            }));
            setLoadError(getErrorMessage(error));
        } finally {
            setPendingCommentIds((currentIds) => currentIds.filter((id) => id !== commentId));
        }
    };

    return (
        <section className='space-y-8 border-t border-border p-6 lg:p-10'>
            <div className='space-y-1'>
                <h2 className='text-2xl font-medium'>Join the conversation</h2>
                <p className='text-sm text-muted-foreground'>
                    Leave comments, upvote the article, and surface the most helpful replies.
                </p>
                <p className='text-xs text-muted-foreground'>
                    Engagement is persisted with Neon via Drizzle and tied to your Clerk account.
                </p>
            </div>

            <div className='rounded-lg border border-border bg-muted/25 p-4'>
                {isSignedIn ? (
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center gap-3'>
                            <UserButton />
                            <div>
                                <p className='text-sm font-medium'>Signed in and ready to engage</p>
                                <p className='text-xs text-muted-foreground'>
                                    Your comments and upvotes sync across devices.
                                </p>
                            </div>
                        </div>
                        <Button
                            type='button'
                            variant={state.userUpvotedArticle ? 'default' : 'outline'}
                            size='sm'
                            aria-pressed={state.userUpvotedArticle}
                            onClick={handleArticleUpvote}
                            disabled={isTogglingArticleUpvote || (isRefreshing && !hasFetched)}
                            className='min-w-[130px] justify-between'>
                            <span className='inline-flex items-center gap-2'>
                                {isTogglingArticleUpvote ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <ChevronUp className='h-4 w-4' />
                                )}
                                {state.userUpvotedArticle ? 'Upvoted' : 'Upvote'}
                            </span>
                            <span className='tabular-nums'>{state.articleUpvotes}</span>
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <p className='text-sm font-medium'>Sign in to comment and upvote</p>
                            <p className='text-xs text-muted-foreground'>
                                We use Clerk for identity and Neon + Drizzle for synced engagement.
                            </p>
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            <SignInButton mode='modal'>
                                <Button type='button' variant='outline' size='sm'>
                                    Sign in
                                </Button>
                            </SignInButton>
                            <Button
                                type='button'
                                variant='secondary'
                                size='sm'
                                onClick={handleArticleUpvote}
                                disabled={isRefreshing && !hasFetched}
                                className='min-w-[130px] justify-between'>
                                <span className='inline-flex items-center gap-2'>
                                    <ChevronUp className='h-4 w-4' />
                                    Upvote
                                </span>
                                <span className='tabular-nums'>{state.articleUpvotes}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {loadError && (
                <div className='flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between'>
                    <p>{loadError}</p>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setRefreshKey((current) => current + 1)}>
                        Retry
                    </Button>
                </div>
            )}

            <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
                <form
                    onSubmit={handleSubmitComment}
                    className='space-y-4 rounded-lg border border-border bg-muted/30 p-4'>
                    <h3 className='text-lg font-medium'>Leave a comment</h3>
                    <p className='text-sm text-muted-foreground'>
                        Comments are posted with your Clerk profile and stored in Neon.
                    </p>

                    <div className='space-y-2'>
                        <label htmlFor={`comment-message-${slug}`} className='text-sm font-medium'>
                            Comment
                        </label>
                        <textarea
                            id={`comment-message-${slug}`}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder='What did you think about this post?'
                            rows={5}
                            maxLength={800}
                            className='min-h-[140px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                        />
                        <div className='flex items-center justify-between gap-3'>
                            <p className='text-xs text-muted-foreground'>
                                {message.length}/800 characters
                            </p>
                            {formError && <p className='text-xs text-destructive'>{formError}</p>}
                        </div>
                    </div>

                    <Button
                        type='submit'
                        className='w-full sm:w-auto'
                        disabled={isSubmittingComment || (isRefreshing && !hasFetched)}>
                        {isSubmittingComment ? (
                            <>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Posting...
                            </>
                        ) : (
                            'Post comment'
                        )}
                    </Button>
                </form>

                <div className='space-y-4'>
                    <h3 className='inline-flex items-center gap-2 text-lg font-medium'>
                        <MessageSquare className='h-4 w-4' />
                        Comments ({state.comments.length})
                    </h3>

                    {isRefreshing && !hasFetched ? (
                        <div className='rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground'>
                            Loading comments and synced upvotes...
                        </div>
                    ) : state.comments.length === 0 ? (
                        <div className='rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground'>
                            No comments yet. Be the first to share feedback.
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {state.comments.map((comment: CommentItem) => {
                                const hasUpvoted = state.upvotedCommentIds.includes(comment.id);
                                const isPending = pendingCommentIds.includes(comment.id);

                                return (
                                    <article
                                        key={comment.id}
                                        className={cn(
                                            'space-y-3 rounded-lg border border-border bg-card p-4',
                                            hasUpvoted && 'border-primary/40',
                                        )}>
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='flex min-w-0 items-start gap-3'>
                                                {comment.authorImageUrl ? (
                                                    <div
                                                        aria-hidden='true'
                                                        className='h-10 w-10 rounded-full border border-border bg-cover bg-center'
                                                        style={{
                                                            backgroundImage: `url("${comment.authorImageUrl}")`,
                                                        }}
                                                    />
                                                ) : (
                                                    <div className='flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground'>
                                                        {getAuthorInitials(comment.authorName)}
                                                    </div>
                                                )}
                                                <div className='min-w-0'>
                                                    <p className='truncate text-sm font-medium'>
                                                        {comment.authorName}
                                                    </p>
                                                    <time className='text-xs text-muted-foreground'>
                                                        {formatCommentDate(comment.createdAt)}
                                                    </time>
                                                </div>
                                            </div>
                                            <Button
                                                type='button'
                                                variant={hasUpvoted ? 'default' : 'outline'}
                                                size='sm'
                                                aria-pressed={hasUpvoted}
                                                onClick={() => handleCommentUpvote(comment.id)}
                                                disabled={isPending}>
                                                {isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                ) : (
                                                    <ChevronUp className='h-4 w-4' />
                                                )}
                                                Upvote
                                                <span className='tabular-nums'>{comment.upvotes}</span>
                                            </Button>
                                        </div>

                                        <p className='whitespace-pre-wrap text-sm text-foreground/90'>
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
