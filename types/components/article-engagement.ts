export type Reaction = 'like' | 'dislike';

export interface CommentItem {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  upvotes: number;
}

export interface EngagementState {
  likes: number;
  dislikes: number;
  articleUpvotes: number;
  userReaction: Reaction | null;
  userUpvotedArticle: boolean;
  comments: CommentItem[];
  upvotedCommentIds: string[];
}

export interface ArticleEngagementProps {
  slug: string;
}
