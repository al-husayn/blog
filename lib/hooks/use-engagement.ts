'use client';

import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createCommentRequest,
    engagementQueryKey,
    fetchEngagement,
    toggleArticleUpvoteRequest,
    toggleCommentUpvoteRequest,
} from '@/lib/api/engagement';
import { getErrorMessage } from '@/lib/api/client';
import {
    createInitialEngagementState,
    insertCommentIntoTree,
    updateCommentInTree,
} from '@/lib/engagement-client';
import type { EngagementResponse } from '@/types/components/article-engagement';

type EngagementQueryKey = ReturnType<typeof engagementQueryKey>;
type CreateCommentInput = { message: string; parentCommentId?: string };

interface UseEngagementQueryOptions {
    slug: string;
    isLoaded: boolean;
    userId?: string | null;
    requestError?: string | null;
}

export const useEngagementQuery = ({
    slug,
    isLoaded,
    userId,
    requestError,
}: UseEngagementQueryOptions) => {
    const queryKey = engagementQueryKey(slug, userId);
    const engagementQuery = useQuery({
        queryKey,
        queryFn: () => fetchEngagement(slug),
        enabled: isLoaded,
        placeholderData: (previousData) =>
            previousData
                ? {
                      ...previousData,
                      userUpvotedArticle: false,
                      upvotedCommentIds: [],
                      isAuthenticated: Boolean(userId),
                  }
                : previousData,
    });

    return {
        queryKey,
        state: engagementQuery.data ?? createInitialEngagementState(),
        loadError:
            requestError ??
            (!engagementQuery.data && engagementQuery.error
                ? getErrorMessage(engagementQuery.error)
                : null),
        isInitialLoading: isLoaded && engagementQuery.isPending && !engagementQuery.data,
        isSyncing: Boolean(engagementQuery.data) && engagementQuery.isFetching,
        refetch: engagementQuery.refetch,
    };
};

interface UseEngagementMutationsOptions {
    slug: string;
    queryKey: EngagementQueryKey;
    onRequestError: (message: string | null) => void;
}

export const useEngagementMutations = ({
    slug,
    queryKey,
    onRequestError,
}: UseEngagementMutationsOptions) => {
    const queryClient = useQueryClient();
    const createCommentMutationKey = ['engagement', slug, 'create-comment'] as const;
    const commentUpvoteMutationKey = ['engagement', slug, 'comment-upvote'] as const;

    const updateCachedEngagement = (
        updater: (current: EngagementResponse) => EngagementResponse,
    ) => {
        queryClient.setQueryData<EngagementResponse>(queryKey, (current) =>
            current ? updater(current) : current,
        );
    };

    const articleUpvoteMutation = useMutation({
        mutationKey: ['engagement', slug, 'article-upvote'],
        mutationFn: () => toggleArticleUpvoteRequest(slug),
        onMutate: async () => {
            onRequestError(null);
            await queryClient.cancelQueries({ queryKey });

            const previousState = queryClient.getQueryData<EngagementResponse>(queryKey);

            if (previousState) {
                const nextUserUpvoted = !previousState.userUpvotedArticle;

                queryClient.setQueryData<EngagementResponse>(queryKey, {
                    ...previousState,
                    articleUpvotes: nextUserUpvoted
                        ? previousState.articleUpvotes + 1
                        : Math.max(0, previousState.articleUpvotes - 1),
                    userUpvotedArticle: nextUserUpvoted,
                });
            }

            return { previousState };
        },
        onError: (error, _variables, context) => {
            if (context?.previousState) {
                queryClient.setQueryData(queryKey, context.previousState);
            }

            onRequestError(getErrorMessage(error));
        },
        onSuccess: (payload) => {
            updateCachedEngagement((current) => ({
                ...current,
                articleUpvotes: payload.articleUpvotes,
                userUpvotedArticle: payload.userUpvotedArticle,
            }));
        },
    });

    const createCommentMutation = useMutation({
        mutationKey: createCommentMutationKey,
        mutationFn: ({ message, parentCommentId }: CreateCommentInput) =>
            createCommentRequest(slug, { message, parentCommentId }),
        onMutate: () => {
            onRequestError(null);
        },
        onSuccess: (payload) => {
            updateCachedEngagement((current) => ({
                ...current,
                comments: insertCommentIntoTree(current.comments, payload.comment),
            }));
        },
    });

    const commentUpvoteMutation = useMutation({
        mutationKey: commentUpvoteMutationKey,
        mutationFn: (commentId: string) => toggleCommentUpvoteRequest(commentId),
        onMutate: async (commentId) => {
            onRequestError(null);
            await queryClient.cancelQueries({ queryKey });

            const previousState = queryClient.getQueryData<EngagementResponse>(queryKey);

            if (previousState) {
                const hasUpvoted = previousState.upvotedCommentIds.includes(commentId);

                queryClient.setQueryData<EngagementResponse>(queryKey, {
                    ...previousState,
                    comments: updateCommentInTree(previousState.comments, commentId, (comment) => ({
                        ...comment,
                        upvotes: hasUpvoted
                            ? Math.max(0, comment.upvotes - 1)
                            : comment.upvotes + 1,
                    })),
                    upvotedCommentIds: hasUpvoted
                        ? previousState.upvotedCommentIds.filter((id) => id !== commentId)
                        : [...previousState.upvotedCommentIds, commentId],
                });
            }

            return { previousState };
        },
        onError: (error, _commentId, context) => {
            if (context?.previousState) {
                queryClient.setQueryData(queryKey, context.previousState);
            }

            onRequestError(getErrorMessage(error));
        },
        onSuccess: (payload) => {
            updateCachedEngagement((current) => ({
                ...current,
                comments: updateCommentInTree(current.comments, payload.commentId, (comment) => ({
                    ...comment,
                    upvotes: payload.upvotes,
                })),
                upvotedCommentIds: payload.userUpvoted
                    ? [...new Set([...current.upvotedCommentIds, payload.commentId])]
                    : current.upvotedCommentIds.filter((id) => id !== payload.commentId),
            }));
        },
    });

    const pendingCommentIds = useMutationState<string>({
        filters: {
            mutationKey: commentUpvoteMutationKey,
            status: 'pending',
        },
        select: (mutation) => mutation.state.variables as string,
    });

    const pendingCommentSubmissions = useMutationState<CreateCommentInput>({
        filters: {
            mutationKey: createCommentMutationKey,
            status: 'pending',
        },
        select: (mutation) => mutation.state.variables as CreateCommentInput,
    });

    return {
        toggleArticleUpvote: articleUpvoteMutation.mutateAsync,
        createComment: createCommentMutation.mutateAsync,
        toggleCommentUpvote: commentUpvoteMutation.mutateAsync,
        isTogglingArticleUpvote: articleUpvoteMutation.isPending,
        pendingCommentIds,
        isSubmittingComment: pendingCommentSubmissions.some(
            (variables) => !variables.parentCommentId,
        ),
        submittingReplyToId:
            pendingCommentSubmissions.find((variables) => Boolean(variables.parentCommentId))
                ?.parentCommentId ?? null,
    };
};
