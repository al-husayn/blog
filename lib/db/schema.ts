import { AnyPgColumn, boolean, index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

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

export const articlePageViews = pgTable(
    'article_page_views',
    {
        id: text('id').primaryKey(),
        articleSlug: text('slug').notNull(),
        path: text('path').notNull(),
        visitorId: text('visitor_id').notNull(),
        sessionId: text('session_id').notNull(),
        sourceGroup: text('source_group').notNull(),
        sourceDetail: text('source_detail'),
        referrerHost: text('referrer_host'),
        referrerUrl: text('referrer_url'),
        keyword: text('keyword'),
        utmSource: text('utm_source'),
        utmMedium: text('utm_medium'),
        utmCampaign: text('utm_campaign'),
        engagedTimeSeconds: integer('engaged_time_seconds').default(0).notNull(),
        maxScrollDepth: integer('max_scroll_depth').default(0).notNull(),
        reached50: boolean('reached_50').default(false).notNull(),
        reached75: boolean('reached_75').default(false).notNull(),
        reached100: boolean('reached_100').default(false).notNull(),
        didBounce: boolean('did_bounce').default(true).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('article_page_views_slug_idx').on(table.articleSlug),
        index('article_page_views_created_at_idx').on(table.createdAt),
        index('article_page_views_visitor_id_idx').on(table.visitorId),
        index('article_page_views_source_group_idx').on(table.sourceGroup),
    ],
);

export const articleShareEvents = pgTable(
    'article_share_events',
    {
        id: text('id').primaryKey(),
        articleSlug: text('slug').notNull(),
        visitorId: text('visitor_id').notNull(),
        sessionId: text('session_id').notNull(),
        network: text('network').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('article_share_events_slug_idx').on(table.articleSlug),
        index('article_share_events_created_at_idx').on(table.createdAt),
        index('article_share_events_network_idx').on(table.network),
    ],
);
