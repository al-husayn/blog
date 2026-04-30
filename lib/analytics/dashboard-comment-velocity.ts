import { inArray } from 'drizzle-orm';
import { COMMENTS_VELOCITY_WINDOW_HOURS, HOUR_IN_MS } from '@/lib/analytics/constants';
import { getDb } from '@/lib/db/client';
import { comments } from '@/lib/db/schema';
import { toDate } from '@/lib/analytics/date';
import { roundToOneDecimal } from '@/lib/analytics/number';
import type { ArticleMetadata } from '@/lib/analytics/types';

export type CommentVelocityMap = Map<
    string,
    { comments48h: number; commentsVelocityPerHour: number }
>;

const getPublishWindowEnds = (
    metadataBySlug: Map<string, ArticleMetadata>,
): Map<string, number> => {
    const publishWindowEnds = new Map<string, number>();

    for (const [slug, metadata] of metadataBySlug) {
        if (metadata.publishedDate) {
            publishWindowEnds.set(
                slug,
                metadata.publishedDate.getTime() + COMMENTS_VELOCITY_WINDOW_HOURS * HOUR_IN_MS,
            );
        }
    }

    return publishWindowEnds;
};

const toVelocityMap = (commentsBySlug: Map<string, number>): CommentVelocityMap =>
    new Map(
        Array.from(commentsBySlug, ([slug, comments48h]) => [
            slug,
            {
                comments48h,
                commentsVelocityPerHour: roundToOneDecimal(
                    comments48h / COMMENTS_VELOCITY_WINDOW_HOURS,
                ),
            },
        ]),
    );

export const getCommentVelocityMap = async (
    metadataBySlug: Map<string, ArticleMetadata>,
): Promise<CommentVelocityMap> => {
    const db = getDb();
    const articleSlugs = Array.from(metadataBySlug.keys());

    if (articleSlugs.length === 0) {
        return new Map();
    }

    const commentRows = await db
        .select({
            articleSlug: comments.articleSlug,
            createdAt: comments.createdAt,
        })
        .from(comments)
        .where(inArray(comments.articleSlug, articleSlugs));

    const publishWindowEnds = getPublishWindowEnds(metadataBySlug);
    const commentsBySlug = new Map<string, number>();

    for (const row of commentRows) {
        const publishWindowEnd = publishWindowEnds.get(row.articleSlug);
        const commentDate = toDate(row.createdAt);

        if (publishWindowEnd && commentDate && commentDate.getTime() <= publishWindowEnd) {
            commentsBySlug.set(row.articleSlug, (commentsBySlug.get(row.articleSlug) ?? 0) + 1);
        }
    }

    return toVelocityMap(commentsBySlug);
};
