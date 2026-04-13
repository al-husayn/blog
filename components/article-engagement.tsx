"use client";

import { SignInButton, UserButton, useAuth, useClerk } from '@clerk/nextjs';
import { gooeyToast } from 'goey-toast';
import { ChevronUp, Loader2, MessageSquare, Reply } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    countComments,
    findCommentInTree,
} from '@/lib/engagement-client';
import {
    useEngagementMutations,
    useEngagementQuery,
} from '@/lib/hooks/use-engagement';
import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { ArticleEngagementProps, CommentItem } from '@/types/components/article-engagement';

const MAX_COMMENT_LENGTH = 800;
const COMMENT_TOAST_TIMING = { displayDuration: 3200 } as const;

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

type SignInPromptScope = 'comment' | 'reply' | 'general';

interface CommentThreadProps {
    comments: CommentItem[];
    activeReplyId: string | null;
    pendingCommentIds: string[];
    replyDrafts: Record<string, string>;
    replyFormError: string | null;
    submittingReplyToId: string | null;
    upvotedCommentIds: string[];
    onCommentUpvote: (commentId: string) => void;
    onReplyDraftChange: (commentId: string, value: string) => void;
    onReplySubmit: (event: FormEvent<HTMLFormElement>, parentCommentId: string) => void;
    onReplyToggle: (commentId: string) => void;
}

function CommentThread({
    comments,
    activeReplyId,
    pendingCommentIds,
    replyDrafts,
    replyFormError,
    submittingReplyToId,
    upvotedCommentIds,
    onCommentUpvote,
    onReplyDraftChange,
    onReplySubmit,
    onReplyToggle,
}: CommentThreadProps) {
    return (
        <div className='min-w-0 space-y-3'>
            {comments.map((comment) => {
                const hasUpvoted = upvotedCommentIds.includes(comment.id);
                const isPending = pendingCommentIds.includes(comment.id);
                const isReplyComposerOpen = activeReplyId === comment.id;
                const replyDraft = replyDrafts[comment.id] ?? '';

                return (
                    <article
                        key={comment.id}
                        className={cn(
                            'min-w-0 space-y-3 overflow-hidden rounded-lg border border-border bg-card p-4',
                            hasUpvoted && 'border-primary/40',
                        )}>
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
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
                                    <p className='truncate text-sm font-medium'>{comment.authorName}</p>
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
                                onClick={() => onCommentUpvote(comment.id)}
                                disabled={isPending}
                                className='w-full justify-between sm:w-auto sm:self-start'>
                                {isPending ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <ChevronUp className='h-4 w-4' />
                                )}
                                Upvote
                                <span className='tabular-nums'>{comment.upvotes}</span>
                            </Button>
                        </div>

                        <p className='whitespace-pre-wrap break-words text-sm text-foreground/90'>
                            {comment.message}
                        </p>

                        <div className='flex flex-wrap items-center gap-2'>
                            <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => onReplyToggle(comment.id)}
                                className='px-2'>
                                <Reply className='h-4 w-4' />
                                {isReplyComposerOpen ? 'Cancel' : 'Reply'}
                            </Button>
                            {comment.replies.length > 0 && (
                                <p className='text-xs text-muted-foreground'>
                                    {comment.replies.length}{' '}
                                    {comment.replies.length === 1 ? 'reply' : 'replies'}
                                </p>
                            )}
                        </div>

                        {isReplyComposerOpen && (
                            <form
                                onSubmit={(event) => onReplySubmit(event, comment.id)}
                                className='min-w-0 space-y-3 rounded-md border border-dashed border-border bg-background/70 p-3'>
                                <div className='space-y-2'>
                                    <label
                                        htmlFor={`reply-message-${comment.id}`}
                                        className='text-sm font-medium'>
                                        Reply
                                    </label>
                                    <textarea
                                        id={`reply-message-${comment.id}`}
                                        value={replyDraft}
                                        onChange={(event) =>
                                            onReplyDraftChange(comment.id, event.target.value)
                                        }
                                        placeholder={`Reply to ${comment.authorName}`}
                                        rows={4}
                                        maxLength={MAX_COMMENT_LENGTH}
                                        className='min-h-[110px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                                    />
                                    <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                        <p className='text-xs text-muted-foreground'>
                                            {replyDraft.length}/{MAX_COMMENT_LENGTH} characters
                                        </p>
                                        {replyFormError && (
                                            <p className='w-full break-words text-xs text-destructive sm:w-auto'>
                                                {replyFormError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type='submit'
                                    size='sm'
                                    disabled={submittingReplyToId === comment.id}>
                                    {submittingReplyToId === comment.id ? (
                                        <>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Posting reply...
                                        </>
                                    ) : (
                                        'Post reply'
                                    )}
                                </Button>
                            </form>
                        )}

                        {comment.replies.length > 0 && (
                            <div className='min-w-0 overflow-hidden space-y-3 border-l border-border/60 pl-3 sm:pl-4'>
                                <CommentThread
                                    comments={comment.replies}
                                    activeReplyId={activeReplyId}
                                    pendingCommentIds={pendingCommentIds}
                                    replyDrafts={replyDrafts}
                                    replyFormError={replyFormError}
                                    submittingReplyToId={submittingReplyToId}
                                    upvotedCommentIds={upvotedCommentIds}
                                    onCommentUpvote={onCommentUpvote}
                                    onReplyDraftChange={onReplyDraftChange}
                                    onReplySubmit={onReplySubmit}
                                    onReplyToggle={onReplyToggle}
                                />
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}

export function ArticleEngagement({ slug, isClerkConfigured }: ArticleEngagementProps) {
    if (!isClerkConfigured) {
        return (
            <section className='space-y-4 border-t border-border p-6 lg:p-10'>
                <div className='space-y-1'>
                    <h2 className='text-2xl font-medium'>Join the conversation</h2>
                    <p className='text-sm text-muted-foreground'>
                        Comments and account-based engagement become available once the required
                        services are configured.
                    </p>
                </div>
                <div className='rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground'>
                    Configure authentication and database access to enable the live engagement
                    system.
                </div>
            </section>
        );
    }

    return <ConfiguredArticleEngagement slug={slug} isClerkConfigured={isClerkConfigured} />;
}

function ConfiguredArticleEngagement({ slug }: ArticleEngagementProps) {
    const { isLoaded, isSignedIn, userId } = useAuth();
    const { openSignIn } = useClerk();
    const [message, setMessage] = useState('');
    const [requestError, setRequestError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [replyFormError, setReplyFormError] = useState<string | null>(null);
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const { queryKey, state, loadError, isInitialLoading, isSyncing, refetch } =
        useEngagementQuery({
            slug,
            isLoaded,
            userId,
            requestError,
        });
    const {
        toggleArticleUpvote,
        createComment,
        toggleCommentUpvote,
        isTogglingArticleUpvote,
        pendingCommentIds,
        isSubmittingComment,
        submittingReplyToId,
    } = useEngagementMutations({
        slug,
        queryKey,
        onRequestError: setRequestError,
    });

    useEffect(() => {
        if (!isSignedIn) {
            return;
        }

        setRequestError(null);
        setFormError(null);
        setReplyFormError(null);
    }, [isSignedIn]);

    const openSignInModal = (messageText: string, scope: SignInPromptScope = 'general') => {
        if (scope === 'comment') {
            setFormError(messageText);
        } else if (scope === 'reply') {
            setReplyFormError(messageText);
        } else {
            setRequestError(messageText);
        }

        void openSignIn();
    };

    const handleArticleUpvote = async () => {
        if (!isSignedIn) {
            openSignInModal('Sign in to upvote this post.');
            return;
        }

        try {
            await toggleArticleUpvote();
        } catch {
            return;
        }
    };

    const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isSignedIn) {
            openSignInModal('Sign in to post a comment.', 'comment');
            return;
        }

        const cleanMessage = message.trim();

        if (!cleanMessage) {
            setFormError('Write a comment before posting.');
            return;
        }

        if (cleanMessage.length > MAX_COMMENT_LENGTH) {
            setFormError('Comment is too long. Keep it under 800 characters.');
            return;
        }

        setFormError(null);

        try {
            const createCommentRequest = createComment({ message: cleanMessage });
            gooeyToast.promise(createCommentRequest, {
                loading: 'Posting comment...',
                success: 'Comment posted',
                error: 'Could not post comment',
                description: {
                    loading: 'Publishing your comment to this post.',
                    success: 'Your comment is now part of the conversation.',
                    error: (error) => getErrorMessage(error),
                },
                timing: COMMENT_TOAST_TIMING,
                showTimestamp: false,
            });
            await createCommentRequest;
            setMessage('');
        } catch (error) {
            setFormError(getErrorMessage(error));
        }
    };

    const handleReplyToggle = (commentId: string) => {
        if (!isSignedIn) {
            openSignInModal('Sign in to reply to comments.', 'reply');
            return;
        }

        setReplyFormError(null);
        setActiveReplyId((currentReplyId) => (currentReplyId === commentId ? null : commentId));
    };

    const handleReplyDraftChange = (commentId: string, value: string) => {
        setReplyFormError(null);
        setReplyDrafts((currentDrafts) => ({
            ...currentDrafts,
            [commentId]: value,
        }));
    };

    const handleReplySubmit = async (
        event: FormEvent<HTMLFormElement>,
        parentCommentId: string,
    ) => {
        event.preventDefault();

        if (!isSignedIn) {
            openSignInModal('Sign in to reply to comments.', 'reply');
            return;
        }

        if (!findCommentInTree(state.comments, parentCommentId)) {
            setReplyFormError('The comment you are replying to could not be found.');
            return;
        }

        const cleanMessage = (replyDrafts[parentCommentId] ?? '').trim();

        if (!cleanMessage) {
            setReplyFormError('Write a reply before posting.');
            return;
        }

        if (cleanMessage.length > MAX_COMMENT_LENGTH) {
            setReplyFormError('Comment is too long. Keep it under 800 characters.');
            return;
        }

        setReplyFormError(null);

        try {
            const createReplyRequest = createComment({
                message: cleanMessage,
                parentCommentId,
            });
            gooeyToast.promise(createReplyRequest, {
                loading: 'Posting reply...',
                success: 'Reply posted',
                error: 'Could not post reply',
                description: {
                    loading: 'Sending your reply into the thread.',
                    success: 'Your reply is now visible in the conversation.',
                    error: (error) => getErrorMessage(error),
                },
                timing: COMMENT_TOAST_TIMING,
                showTimestamp: false,
            });
            await createReplyRequest;
            setReplyDrafts((currentDrafts) => {
                const nextDrafts = { ...currentDrafts };
                delete nextDrafts[parentCommentId];

                return nextDrafts;
            });
            setActiveReplyId(null);
        } catch (error) {
            setReplyFormError(getErrorMessage(error));
        }
    };

    const handleCommentUpvote = async (commentId: string) => {
        if (!isSignedIn) {
            openSignInModal('Sign in to upvote comments.');
            return;
        }

        if (!findCommentInTree(state.comments, commentId)) {
            return;
        }

        try {
            await toggleCommentUpvote(commentId);
        } catch {
            return;
        }
    };

    const totalCommentCount = countComments(state.comments);

    return (
        <section className='space-y-8 border-t border-border p-4 sm:p-6 lg:p-10'>
            <div className='space-y-1'>
                <h2 className='text-2xl font-medium'>Join the conversation</h2>
                <p className='text-sm text-muted-foreground'>
                    Share your perspective, upvote the article, and highlight the most helpful
                    replies.
                </p>
                <p className='text-xs text-muted-foreground'>
                    Your participation is linked to your account for a consistent experience across
                    sessions.
                </p>
                {isSyncing && (
                    <p className='text-xs text-muted-foreground'>Syncing the latest comments and votes...</p>
                )}
            </div>

            <div className='rounded-lg border border-border bg-muted/25 p-4'>
                {isSignedIn ? (
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center gap-3'>
                            <UserButton />
                            <div>
                                <p className='text-sm font-medium'>Signed in and ready to engage</p>
                                <p className='text-xs text-muted-foreground'>
                                    Your comments, replies, and votes stay connected to your
                                    account.
                                </p>
                            </div>
                        </div>
                        <Button
                            type='button'
                            variant={state.userUpvotedArticle ? 'default' : 'outline'}
                            size='sm'
                            aria-pressed={state.userUpvotedArticle}
                            onClick={handleArticleUpvote}
                            disabled={isTogglingArticleUpvote || isInitialLoading || !isLoaded}
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
                            <p className='text-sm font-medium'>Sign in to participate</p>
                            <p className='text-xs text-muted-foreground'>
                                Join the discussion and keep your activity associated with your
                                account.
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
                                disabled={isInitialLoading || !isLoaded}
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
                        onClick={() => {
                            setRequestError(null);
                            void refetch();
                        }}>
                        Retry
                    </Button>
                </div>
            )}

            <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
                <form
                    onSubmit={handleSubmitComment}
                    className='min-w-0 space-y-4 rounded-lg border border-border bg-muted/30 p-4'>
                    <h3 className='text-lg font-medium'>Leave a comment</h3>
                    <p className='text-sm text-muted-foreground'>
                        Comments are published under your account and saved so you can continue the
                        conversation over time.
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
                            maxLength={MAX_COMMENT_LENGTH}
                            className='min-h-[140px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                        />
                        <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <p className='text-xs text-muted-foreground'>
                                {message.length}/{MAX_COMMENT_LENGTH} characters
                            </p>
                            {formError && (
                                <p className='w-full break-words text-xs text-destructive sm:w-auto'>
                                    {formError}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        type='submit'
                        className='w-full sm:w-auto'
                        disabled={isSubmittingComment || isInitialLoading || !isLoaded}>
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

                <div className='min-w-0 space-y-4'>
                    <h3 className='inline-flex items-center gap-2 text-lg font-medium'>
                        <MessageSquare className='h-4 w-4' />
                        Comments ({totalCommentCount})
                    </h3>

                    {isInitialLoading ? (
                        <div className='rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground'>
                            Loading comments and synced upvotes...
                        </div>
                    ) : totalCommentCount === 0 ? (
                        <div className='rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground'>
                            No comments yet. Be the first to share feedback.
                        </div>
                    ) : (
                        <CommentThread
                            comments={state.comments}
                            activeReplyId={activeReplyId}
                            pendingCommentIds={pendingCommentIds}
                            replyDrafts={replyDrafts}
                            replyFormError={replyFormError}
                            submittingReplyToId={submittingReplyToId}
                            upvotedCommentIds={state.upvotedCommentIds}
                            onCommentUpvote={handleCommentUpvote}
                            onReplyDraftChange={handleReplyDraftChange}
                            onReplySubmit={handleReplySubmit}
                            onReplyToggle={handleReplyToggle}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
