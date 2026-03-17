export interface CommentItem {
    id: string;
    authorName: string;
    authorImageUrl: string | null;
    message: string;
    createdAt: string;
    upvotes: number;
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
}
