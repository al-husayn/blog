import { AnyPgColumn, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const comments = pgTable(
    'article_comments',
    {
        id: text('id').primaryKey(),
        articleSlug: text('slug').notNull(),
        parentCommentId: text('parent_comment_id').references(
            (): AnyPgColumn => comments.id,
            { onDelete: 'cascade' },
        ),
        clerkUserId: text('user_id').notNull(),
        authorName: text('author').notNull(),
        authorImageUrl: text('author_image_url'),
        message: text('message').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('comments_article_slug_idx').on(table.articleSlug),
        index('comments_parent_comment_id_idx').on(table.parentCommentId),
        index('comments_clerk_user_id_idx').on(table.clerkUserId),
    ],
);

export const articleUpvotes = pgTable(
    'article_upvotes',
    {
        articleSlug: text('slug').notNull(),
        clerkUserId: text('user_id').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.articleSlug, table.clerkUserId],
            name: 'article_upvotes_pk',
        }),
        index('article_upvotes_article_slug_idx').on(table.articleSlug),
    ],
);

export const commentUpvotes = pgTable(
    'comment_upvotes',
    {
        commentId: text('comment_id')
            .references(() => comments.id, { onDelete: 'cascade' })
            .notNull(),
        clerkUserId: text('user_id').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.commentId, table.clerkUserId],
            name: 'comment_upvotes_pk',
        }),
        index('comment_upvotes_comment_id_idx').on(table.commentId),
    ],
);
