import type { engagementQueryKey } from '@/lib/api/engagement';

export type EngagementQueryKey = ReturnType<typeof engagementQueryKey>;

export interface CreateCommentInput {
    message: string;
    parentCommentId?: string;
}

export interface UseEngagementQueryOptions {
    slug: string;
    isLoaded: boolean;
    userId?: string | null;
    requestError?: string | null;
}

export interface UseEngagementMutationsOptions {
    slug: string;
    queryKey: EngagementQueryKey;
    onRequestError: (message: string | null) => void;
}
