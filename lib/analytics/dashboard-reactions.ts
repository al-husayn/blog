import { count } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { articleUpvotes, comments } from '@/lib/db/schema';
import { toNumber } from '@/lib/analytics/number';

export interface ReactionMaps {
    commentsBySlug: Map<string, number>;
    reactionsBySlug: Map<string, number>;
}

export const toSlugCountMap = (
    rows: Array<{ articleSlug: string; value: number | string | bigint }>,
) => new Map(rows.map((row) => [row.articleSlug, toNumber(row.value)]));

export const getReactionMaps = async (): Promise<ReactionMaps> => {
    const db = getDb();
    const [commentRows, reactionRows] = await Promise.all([
        db
            .select({
                articleSlug: comments.articleSlug,
                value: count(),
            })
            .from(comments)
            .groupBy(comments.articleSlug),
        db
            .select({
                articleSlug: articleUpvotes.articleSlug,
                value: count(),
            })
            .from(articleUpvotes)
            .groupBy(articleUpvotes.articleSlug),
    ]);

    return {
        commentsBySlug: toSlugCountMap(commentRows),
        reactionsBySlug: toSlugCountMap(reactionRows),
    };
};
