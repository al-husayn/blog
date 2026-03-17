import { and, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/lib/db/client';
import { articleUpvotes, commentUpvotes, comments } from '@/lib/db/schema';
import type {
    CommentItem,
    EngagementResponse,
    ToggleArticleUpvoteResponse,
    ToggleCommentUpvoteResponse,
} from '@/types/components/article-engagement';

export const createCommentSchema = z.object({
    message: z
        .string()
        .trim()
        .min(1, 'Write a comment before posting.')
        .max(800, 'Comment is too long. Keep it under 800 characters.'),
});

const toCount = (value: number | string | bigint): number => Number(value);

const toIsoString = (value: Date | string): string => new Date(value).toISOString();

const mapComment = (comment: {
    id: string;
    authorName: string;
    authorImageUrl: string | null;
    message: string;
    createdAt: Date | string;
    upvotes: number | string | bigint;
}): CommentItem => ({
    id: comment.id,
    authorName: comment.authorName,
    authorImageUrl: comment.authorImageUrl,
    message: comment.message,
    createdAt: toIsoString(comment.createdAt),
    upvotes: toCount(comment.upvotes),
});

export async function getEngagement(
    articleSlug: string,
    clerkUserId?: string,
): Promise<EngagementResponse> {
    const db = getDb();

    const [articleUpvoteRows, commentRows, userArticleUpvoteRows, upvotedCommentRows] =
        await Promise.all([
            db
                .select({ count: count() })
                .from(articleUpvotes)
                .where(eq(articleUpvotes.articleSlug, articleSlug)),
            db
                .select({
                    id: comments.id,
                    authorName: comments.authorName,
                    authorImageUrl: comments.authorImageUrl,
                    message: comments.message,
                    createdAt: comments.createdAt,
                    upvotes: count(commentUpvotes.commentId),
                })
                .from(comments)
                .leftJoin(commentUpvotes, eq(comments.id, commentUpvotes.commentId))
                .where(eq(comments.articleSlug, articleSlug))
                .groupBy(comments.id)
                .orderBy(desc(comments.createdAt)),
            clerkUserId
                ? db
                      .select({ articleSlug: articleUpvotes.articleSlug })
                      .from(articleUpvotes)
                      .where(
                          and(
                              eq(articleUpvotes.articleSlug, articleSlug),
                              eq(articleUpvotes.clerkUserId, clerkUserId),
                          ),
                      )
                : Promise.resolve([]),
            clerkUserId
                ? db
                      .select({ commentId: commentUpvotes.commentId })
                      .from(commentUpvotes)
                      .innerJoin(comments, eq(commentUpvotes.commentId, comments.id))
                      .where(
                          and(
                              eq(commentUpvotes.clerkUserId, clerkUserId),
                              eq(comments.articleSlug, articleSlug),
                          ),
                      )
                : Promise.resolve([]),
        ]);

    return {
        articleUpvotes: toCount(articleUpvoteRows[0]?.count ?? 0),
        userUpvotedArticle: userArticleUpvoteRows.length > 0,
        comments: commentRows.map(mapComment),
        upvotedCommentIds: upvotedCommentRows.map((comment) => comment.commentId),
        isAuthenticated: Boolean(clerkUserId),
    };
}

export async function toggleArticleUpvote(
    articleSlug: string,
    clerkUserId: string,
): Promise<ToggleArticleUpvoteResponse> {
    const db = getDb();

    const insertedRows = await db
        .insert(articleUpvotes)
        .values({ articleSlug, clerkUserId })
        .onConflictDoNothing()
        .returning({ articleSlug: articleUpvotes.articleSlug });

    const userUpvotedArticle = insertedRows.length > 0;

    if (!userUpvotedArticle) {
        await db
            .delete(articleUpvotes)
            .where(
                and(
                    eq(articleUpvotes.articleSlug, articleSlug),
                    eq(articleUpvotes.clerkUserId, clerkUserId),
                ),
            );
    }

    const articleUpvoteRows = await db
        .select({ count: count() })
        .from(articleUpvotes)
        .where(eq(articleUpvotes.articleSlug, articleSlug));

    return {
        articleUpvotes: toCount(articleUpvoteRows[0]?.count ?? 0),
        userUpvotedArticle,
    };
}

export async function createComment(input: {
    articleSlug: string;
    clerkUserId: string;
    authorName: string;
    authorImageUrl?: string | null;
    message: string;
}): Promise<CommentItem> {
    const db = getDb();
    const commentId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const [comment] = await db
        .insert(comments)
        .values({
            id: commentId,
            articleSlug: input.articleSlug,
            clerkUserId: input.clerkUserId,
            authorName: input.authorName,
            authorImageUrl: input.authorImageUrl ?? null,
            message: input.message,
        })
        .returning();

    return mapComment({
        ...comment,
        upvotes: 0,
    });
}

export async function toggleCommentUpvote(
    commentId: string,
    clerkUserId: string,
): Promise<ToggleCommentUpvoteResponse | null> {
    const db = getDb();
    const [comment] = await db
        .select({ id: comments.id })
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

    if (!comment) {
        return null;
    }

    const insertedRows = await db
        .insert(commentUpvotes)
        .values({ commentId, clerkUserId })
        .onConflictDoNothing()
        .returning({ commentId: commentUpvotes.commentId });

    const userUpvoted = insertedRows.length > 0;

    if (!userUpvoted) {
        await db
            .delete(commentUpvotes)
            .where(
                and(
                    eq(commentUpvotes.commentId, commentId),
                    eq(commentUpvotes.clerkUserId, clerkUserId),
                ),
            );
    }

    const upvoteRows = await db
        .select({ count: count() })
        .from(commentUpvotes)
        .where(eq(commentUpvotes.commentId, commentId));

    return {
        commentId,
        upvotes: toCount(upvoteRows[0]?.count ?? 0),
        userUpvoted,
    };
}
