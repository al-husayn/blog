import type { CommentItem, EngagementState } from '@/types/components/article-engagement';

export const createInitialEngagementState = (): EngagementState => ({
    articleUpvotes: 0,
    userUpvotedArticle: false,
    comments: [],
    upvotedCommentIds: [],
});

export const countComments = (comments: CommentItem[]): number =>
    comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0);

export const findCommentInTree = (
    comments: CommentItem[],
    commentId: string,
): CommentItem | undefined => {
    for (const comment of comments) {
        if (comment.id === commentId) {
            return comment;
        }

        const nestedComment = findCommentInTree(comment.replies, commentId);

        if (nestedComment) {
            return nestedComment;
        }
    }

    return undefined;
};

export const updateCommentInTree = (
    comments: CommentItem[],
    commentId: string,
    updater: (comment: CommentItem) => CommentItem,
): CommentItem[] =>
    comments.map((comment) => {
        if (comment.id === commentId) {
            return updater(comment);
        }

        if (comment.replies.length === 0) {
            return comment;
        }

        return {
            ...comment,
            replies: updateCommentInTree(comment.replies, commentId, updater),
        };
    });

const insertReplyIntoTree = (
    comments: CommentItem[],
    parentCommentId: string,
    reply: CommentItem,
): [CommentItem[], boolean] => {
    let hasInserted = false;

    const nextComments = comments.map((comment) => {
        if (comment.id === parentCommentId) {
            hasInserted = true;

            return {
                ...comment,
                replies: [...comment.replies, reply],
            };
        }

        if (comment.replies.length === 0) {
            return comment;
        }

        const [nextReplies, insertedIntoReplies] = insertReplyIntoTree(
            comment.replies,
            parentCommentId,
            reply,
        );

        if (!insertedIntoReplies) {
            return comment;
        }

        hasInserted = true;

        return {
            ...comment,
            replies: nextReplies,
        };
    });

    return [nextComments, hasInserted];
};

export const insertCommentIntoTree = (
    comments: CommentItem[],
    newComment: CommentItem,
): CommentItem[] => {
    if (!newComment.parentCommentId) {
        return [newComment, ...comments];
    }

    const [nextComments, hasInserted] = insertReplyIntoTree(
        comments,
        newComment.parentCommentId,
        newComment,
    );

    return hasInserted ? nextComments : comments;
};
