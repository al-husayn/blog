import type { FormEvent } from 'react';

export interface CommentItem {
    id: string;
    parentCommentId: string | null;
    authorName: string;
    authorImageUrl: string | null;
    message: string;
    createdAt: string;
    upvotes: number;
    replies: CommentItem[];
}

export interface EngagementState {
    articleUpvotes: number;
    userUpvotedArticle: boolean;
    comments: CommentItem[];
    upvotedCommentIds: string[];
}

export interface EngagementResponse extends EngagementState {
    isAuthenticated: boolean;
}

export interface ToggleArticleUpvoteResponse {
    articleUpvotes: number;
    userUpvotedArticle: boolean;
}

export interface ToggleCommentUpvoteResponse {
    commentId: string;
    upvotes: number;
    userUpvoted: boolean;
}

export interface CreateCommentResponse {
    comment: CommentItem;
}

export interface ArticleEngagementProps {
    slug: string;
    isClerkConfigured: boolean;
}

export type SignInPromptScope = 'comment' | 'reply' | 'general';

export interface CommentThreadProps {
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
