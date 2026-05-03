'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, LeaderboardList } from '@/components/admin/analytics-dashboard-primitives';
import {
    formatCompactNumber,
    formatDuration,
    formatNumber,
    formatPercent,
} from '@/components/admin/analytics-dashboard-utils';
import type { AnalyticsDashboardSectionProps } from '@/types/components/admin-analytics';
import type { DashboardTopPostMetric } from '@/types/analytics';

const emptyRankingsMessage = 'Post rankings will appear after article visits are recorded.';

export function TopPostsCard({ data }: AnalyticsDashboardSectionProps) {
    return (
        <Card
            title='Top Posts'
            description='Separate leaders for the last 30 days and all-time, followed by a detailed table that combines traffic and quality metrics.'
            className='md:col-span-2 xl:col-span-12'
        >
            <div className='space-y-5'>
                <div className='grid gap-4 xl:grid-cols-2'>
                    <LeaderboardList
                        title='Trending in the last 30d'
                        posts={data.topPosts}
                        metricLabel='30d views'
                        metricValue={(post) => formatCompactNumber(post.views30d)}
                    />
                    <LeaderboardList
                        title='All-time leaders'
                        posts={data.topPostsAllTime}
                        metricLabel='all-time views'
                        metricValue={(post) => formatCompactNumber(post.viewsAllTime)}
                    />
                </div>

                <TopPostsMobileList posts={data.topPosts} />
                <TopPostsTable posts={data.topPosts} />
            </div>
        </Card>
    );
}

function TopPostsMobileList({ posts }: { posts: DashboardTopPostMetric[] }) {
    return (
        <div className='grid gap-3 xl:hidden'>
            {posts.length > 0 ? (
                posts.map((post) => <TopPostsMobileCard key={`mobile-${post.slug}`} post={post} />)
            ) : (
                <div className='rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
                    {emptyRankingsMessage}
                </div>
            )}
        </div>
    );
}

function TopPostsMobileCard({ post }: { post: DashboardTopPostMetric }) {
    const metrics = [
        { label: 'Unique 30d', value: formatNumber(post.uniqueVisitors30d) },
        { label: 'Engagement', value: formatDuration(post.avgEngagementSeconds) },
        { label: 'Bounce', value: formatPercent(post.bounceRate) },
        { label: 'Reactions', value: formatNumber(post.reactions) },
        { label: 'Comments', value: formatNumber(post.comments) },
        { label: 'Shares 30d', value: formatNumber(post.shares30d) },
    ];

    return (
        <article className='rounded-[22px] border border-border/70 bg-background/60 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)]'>
            <div className='space-y-2'>
                <PostLink post={post} />
                <p className='line-clamp-2 text-sm text-muted-foreground'>{post.description}</p>
            </div>
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                <MobileStatCard label='30d Views' value={formatNumber(post.views30d)} />
                <MobileStatCard label='All-time Views' value={formatNumber(post.viewsAllTime)} />
            </div>
            <div className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {metrics.map((metric) => (
                    <div key={metric.label}>
                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                            {metric.label}
                        </p>
                        <p className='mt-1 text-sm font-medium text-foreground'>{metric.value}</p>
                    </div>
                ))}
            </div>
        </article>
    );
}

function MobileStatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className='rounded-2xl border border-border/60 bg-background/70 p-3'>
            <p className='text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>{label}</p>
            <p className='mt-2 text-xl font-semibold'>{value}</p>
        </div>
    );
}

function TopPostsTable({ posts }: { posts: DashboardTopPostMetric[] }) {
    return (
        <div className='hidden overflow-x-auto xl:block'>
            <table className='min-w-[980px] border-separate border-spacing-y-3'>
                <thead>
                    <tr className='text-left text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                        <th className='pb-1 pr-4 font-medium'>Post</th>
                        <th className='pb-1 pr-4 font-medium'>30d Views</th>
                        <th className='pb-1 pr-4 font-medium'>All-time</th>
                        <th className='pb-1 pr-4 font-medium'>Unique 30d</th>
                        <th className='pb-1 pr-4 font-medium'>Engagement</th>
                        <th className='pb-1 pr-4 font-medium'>Bounce</th>
                        <th className='pb-1 pr-4 font-medium'>Reactions</th>
                        <th className='pb-1 pr-4 font-medium'>Comments</th>
                        <th className='pb-1 font-medium'>Shares 30d</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length > 0 ? (
                        posts.map((post) => <TopPostsTableRow key={post.slug} post={post} />)
                    ) : (
                        <tr>
                            <td
                                colSpan={9}
                                className='rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'
                            >
                                {emptyRankingsMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function TopPostsTableRow({ post }: { post: DashboardTopPostMetric }) {
    return (
        <tr className='rounded-2xl bg-background/60 text-sm shadow-[0_8px_30px_rgba(15,23,42,0.05)]'>
            <td className='rounded-l-2xl border border-border/70 border-r-0 px-4 py-4 align-top'>
                <div className='space-y-1'>
                    <PostLink post={post} />
                    <p className='line-clamp-2 max-w-sm text-muted-foreground'>
                        {post.description}
                    </p>
                </div>
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4 font-medium'>
                {formatNumber(post.views30d)}
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4 font-medium'>
                {formatNumber(post.viewsAllTime)}
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4 text-muted-foreground'>
                {formatNumber(post.uniqueVisitors30d)}
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4 text-muted-foreground'>
                {formatDuration(post.avgEngagementSeconds)}
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4 text-muted-foreground'>
                {formatPercent(post.bounceRate)}
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4'>
                {formatNumber(post.reactions)}
            </td>
            <td className='border border-border/70 border-l-0 border-r-0 px-4 py-4'>
                {formatNumber(post.comments)}
            </td>
            <td className='rounded-r-2xl border border-border/70 border-l-0 px-4 py-4'>
                {formatNumber(post.shares30d)}
            </td>
        </tr>
    );
}

function PostLink({ post }: { post: DashboardTopPostMetric }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className='inline-flex max-w-full items-center gap-2 font-medium text-foreground transition-colors hover:text-orange-600'
        >
            <span className='truncate'>{post.title}</span>
            <ArrowRight className='h-4 w-4 shrink-0' />
        </Link>
    );
}
