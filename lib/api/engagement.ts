import { requestJson } from '@/lib/api/client';
import type {
    CreateCommentResponse,
    EngagementResponse,
    ToggleArticleUpvoteResponse,
    ToggleCommentUpvoteResponse,
} from '@/types/components/article-engagement';

export const engagementQueryKey = (slug: string, viewerKey?: string | null) =>
    ['engagement', slug, viewerKey ?? 'guest'] as const;

export const fetchEngagement = (slug: string): Promise<EngagementResponse> =>
    requestJson<EngagementResponse>(`/api/engagement/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
    });

export const toggleArticleUpvoteRequest = (slug: string): Promise<ToggleArticleUpvoteResponse> =>
    requestJson<ToggleArticleUpvoteResponse>(
        `/api/engagement/${encodeURIComponent(slug)}/article-upvotes`,
        {
            method: 'POST',
        },
    );

export const createCommentRequest = (
    slug: string,
    input: { message: string; parentCommentId?: string },
): Promise<CreateCommentResponse> =>
    requestJson<CreateCommentResponse>(`/api/engagement/${encodeURIComponent(slug)}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

export const toggleCommentUpvoteRequest = (
    commentId: string,
): Promise<ToggleCommentUpvoteResponse> =>
    requestJson<ToggleCommentUpvoteResponse>(
        `/api/engagement/comments/${encodeURIComponent(commentId)}/upvote`,
        {
            method: 'POST',
        },
    );
