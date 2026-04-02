'use client';

import Link from 'next/link';
import {
    ArrowRight,
    ChartNoAxesColumn,
    Clock3,
    Eye,
    Gauge,
    Search,
    Share2,
    Users,
} from 'lucide-react';
import type { DashboardAnalytics } from '@/types/analytics';
import {
    Card,
    DonutChart,
    EngagementGauge,
    LeaderboardList,
    LineChart,
    Sparkline,
} from '@/components/admin/analytics-dashboard-primitives';
import {
    formatCompactNumber,
    formatDelta,
    formatDuration,
    formatNumber,
    formatPercent,
    formatSourceShare,
    sourceColors,
} from '@/components/admin/analytics-dashboard-utils';

interface AnalyticsDashboardSectionProps {
    data: DashboardAnalytics;
}

export function ViewsCard({ data }: AnalyticsDashboardSectionProps) {
    return (
        <Card
            title='Traffic & Reach'
            description='Pageviews across the core reporting windows, with the current month front and center and mini trends for each period.'
            className='md:col-span-2 xl:col-span-7'>
            <div className='grid gap-4 2xl:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.95fr)]'>
                <div className='space-y-5 rounded-[24px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(234,88,12,0.12),rgba(234,88,12,0.02)_55%,rgba(255,255,255,0))] p-4 sm:p-5'>
                    <div className='flex flex-col items-start justify-between gap-4 sm:flex-row'>
                        <div>
                            <p className='text-sm font-medium uppercase tracking-[0.24em] text-orange-600'>
                                30d Views
                            </p>
                            <div className='mt-3 flex flex-wrap items-end gap-3'>
                                <p className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                    {formatCompactNumber(data.views30d)}
                                </p>
                                <p className='mb-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-300'>
                                    {formatDelta(data.viewsDeltaVsPrevious30d)}
                                </p>
                            </div>
                            <p className='mt-2 text-sm text-muted-foreground'>
                                Previous 30 days comparison, based on first-party article visits.
                            </p>
                        </div>
                        <div className='w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left sm:w-auto sm:text-right'>
                            <p className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                                Unique 30d
                            </p>
                            <p className='mt-1 text-2xl font-semibold'>
                                {formatNumber(data.uniqueVisitors30d)}
                            </p>
                        </div>
                    </div>
                    <Sparkline points={data.pageviewSparkline} />
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                    {data.periods.map((period, index) => (
                        <div
                            key={period.label}
                            className='rounded-[22px] border border-border/70 bg-background/60 p-4'>
                            <div className='flex items-center justify-between gap-3'>
                                <p className='text-sm font-medium text-muted-foreground'>{period.label}</p>
                                <Eye className='h-4 w-4 text-muted-foreground' />
                            </div>
                            <p className='mt-4 text-2xl font-semibold tracking-tight'>
                                {formatCompactNumber(period.views)}
                            </p>
                            <p className='mt-1 text-sm text-muted-foreground'>
                                {formatNumber(period.uniqueVisitors)} unique visitors
                            </p>
                            <div className='mt-4 h-14'>
                                <Sparkline
                                    points={period.trend}
                                    height={56}
                                    stroke={index % 2 === 0 ? '#0f766e' : '#2563eb'}
                                    gradientId={`period-trend-${period.label}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

export function AudienceCard({ data }: AnalyticsDashboardSectionProps) {
    const audienceSegments = [
        {
            label: 'New',
            value: data.newVsReturning30d.newVisitors,
            color: sourceColors.new,
        },
        {
            label: 'Returning',
            value: data.newVsReturning30d.returningVisitors,
            color: sourceColors.returning,
        },
    ];

    return (
        <Card
            title='Audience Mix'
            description='Unique reader counts and how much of the current month is driven by fresh discovery versus repeat attention.'
            className='xl:col-span-5'>
            <div className='grid gap-6 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:items-center'>
                <div className='flex justify-center lg:justify-start'>
                    <DonutChart
                        segments={audienceSegments}
                        centerLabel={formatNumber(data.uniqueVisitors30d)}
                        centerSubLabel='visitors'
                    />
                </div>
                <div className='flex-1 space-y-4'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <p className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                                30d Unique
                            </p>
                            <p className='mt-2 text-3xl font-semibold'>
                                {formatNumber(data.uniqueVisitors30d)}
                            </p>
                        </div>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <p className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                                All-time Unique
                            </p>
                            <p className='mt-2 text-3xl font-semibold'>
                                {formatNumber(data.uniqueVisitorsAllTime)}
                            </p>
                        </div>
                    </div>
                    <div className='space-y-3'>
                        {audienceSegments.map((segment) => (
                            <div key={segment.label} className='space-y-2'>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='font-medium'>{segment.label}</p>
                                    <p className='text-muted-foreground'>
                                        {formatNumber(segment.value)} readers
                                    </p>
                                </div>
                                <div className='h-2 rounded-full bg-muted/60'>
                                    <div
                                        className='h-full rounded-full'
                                        style={{
                                            width: `${data.newVsReturning30d.total === 0 ? 0 : (segment.value / data.newVsReturning30d.total) * 100}%`,
                                            backgroundColor: segment.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function SourcesCard({ data }: AnalyticsDashboardSectionProps) {
    const totalSources = data.sources30d.reduce((sum, source) => sum + source.value, 0);
    const sourceSegments = data.sources30d.map((source) => ({
        label: source.label,
        value: source.value,
        color: sourceColors[source.key] ?? '#64748b',
    }));

    return (
        <Card
            title='Traffic Sources'
            description='Where readers are coming from in the last 30 days, with both share-of-traffic context and the strongest referrer details.'
            className='md:col-span-2 xl:col-span-7'>
            <div className='grid gap-6 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:items-start'>
                <div className='flex justify-center xl:justify-start'>
                    <DonutChart
                        segments={sourceSegments}
                        centerLabel={formatNumber(totalSources)}
                        centerSubLabel='30d visits'
                    />
                </div>
                <div className='space-y-4'>
                    <div className='overflow-hidden rounded-full bg-muted/60'>
                        <div className='flex h-4 w-full'>
                            {data.sources30d.map((source) => (
                                <div
                                    key={`source-bar-${source.key}`}
                                    style={{
                                        width: `${totalSources === 0 ? 0 : (source.value / totalSources) * 100}%`,
                                        backgroundColor: sourceColors[source.key] ?? '#64748b',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        {data.sources30d.map((source) => (
                            <div
                                key={source.key}
                                className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                                <div className='flex items-center justify-between gap-3'>
                                    <div className='flex items-center gap-3'>
                                        <span
                                            className='h-3 w-3 rounded-full'
                                            style={{
                                                backgroundColor: sourceColors[source.key] ?? '#64748b',
                                            }}
                                        />
                                        <p className='font-medium'>{source.label}</p>
                                    </div>
                                    <p className='text-sm text-muted-foreground'>
                                        {formatSourceShare(source.value, totalSources)}
                                    </p>
                                </div>
                                <p className='mt-3 text-3xl font-semibold tracking-tight'>
                                    {formatCompactNumber(source.value)}
                                </p>
                                <div className='mt-4 space-y-2 text-sm text-muted-foreground'>
                                    {source.details.length > 0 ? (
                                        source.details.map((detail) => (
                                            <div
                                                key={detail.label}
                                                className='flex items-center justify-between gap-3'>
                                                <p>{detail.label}</p>
                                                <p className='font-medium text-foreground'>
                                                    {formatNumber(detail.value)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No source detail recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function EngagementCard({ data }: AnalyticsDashboardSectionProps) {
    const scrollMilestones = [
        { label: 'Reached 50%', value: data.scrollReach30d.reached50, color: '#0f766e' },
        { label: 'Reached 75%', value: data.scrollReach30d.reached75, color: '#ea580c' },
        { label: 'Reached 100%', value: data.scrollReach30d.reached100, color: '#2563eb' },
    ];

    return (
        <Card
            title='Engagement Quality'
            description='Engaged time, bounce rate, scroll completion, and a single score to judge how healthy article sessions feel overall.'
            className='xl:col-span-5'>
            <div className='grid gap-6 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:items-center'>
                <div className='flex justify-center xl:justify-start'>
                    <EngagementGauge score={data.engagementScore30d} label='30d reading quality' />
                </div>
                <div className='space-y-4'>
                    <div className='grid gap-3 sm:grid-cols-3'>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <Clock3 className='h-4 w-4 text-muted-foreground' />
                            <p className='mt-3 text-3xl font-semibold'>
                                {formatDuration(data.avgEngagementSeconds30d)}
                            </p>
                            <p className='mt-1 text-sm text-muted-foreground'>Avg engaged time</p>
                        </div>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <Gauge className='h-4 w-4 text-muted-foreground' />
                            <p className='mt-3 text-3xl font-semibold'>
                                {formatPercent(data.bounceRate30d)}
                            </p>
                            <p className='mt-1 text-sm text-muted-foreground'>Bounce rate</p>
                        </div>
                        <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                            <ChartNoAxesColumn className='h-4 w-4 text-muted-foreground' />
                            <p className='mt-3 text-3xl font-semibold'>
                                {formatPercent(data.avgScrollDepth30d)}
                            </p>
                            <p className='mt-1 text-sm text-muted-foreground'>Avg scroll depth</p>
                        </div>
                    </div>
                    <div className='space-y-3 rounded-2xl border border-border/70 bg-background/60 p-4'>
                        {scrollMilestones.map((item) => (
                            <div key={item.label} className='space-y-2'>
                                <div className='flex items-center justify-between text-sm'>
                                    <p className='font-medium'>{item.label}</p>
                                    <p className='text-muted-foreground'>{formatPercent(item.value)}</p>
                                </div>
                                <div className='h-2 rounded-full bg-muted/60'>
                                    <div
                                        className='h-full rounded-full'
                                        style={{
                                            width: `${item.value}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function ViralityCard({ data }: AnalyticsDashboardSectionProps) {
    const topVelocityPosts = [...data.topPosts]
        .sort((left, right) => right.comments48h - left.comments48h)
        .filter((post) => post.comments48h > 0)
        .slice(0, 3);

    return (
        <Card
            title='Social & Virality'
            description='Share actions, interaction density, and early comment momentum within the first 48 hours after publishing.'
            className='md:col-span-2 xl:col-span-7'>
            <div className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                        <Share2 className='h-4 w-4 text-muted-foreground' />
                        <p className='mt-3 text-3xl font-semibold'>
                            {formatCompactNumber(data.totalShares30d)}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>Shares in the last 30d</p>
                    </div>
                    <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                        <Users className='h-4 w-4 text-muted-foreground' />
                        <p className='mt-3 text-3xl font-semibold'>
                            {formatCompactNumber(data.totalReactionsAllTime)}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>
                            All-time reactions, comments, and shares
                        </p>
                    </div>
                    <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                        <ArrowRight className='h-4 w-4 text-muted-foreground' />
                        <p className='mt-3 text-3xl font-semibold'>
                            {data.avgInteractionsPerPost.toFixed(
                                data.avgInteractionsPerPost % 1 === 0 ? 0 : 1,
                            )}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>Avg interactions per post</p>
                    </div>
                </div>

                <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                    <p className='text-sm font-medium'>Share breakdown</p>
                    <div className='mt-3 space-y-3'>
                        {data.shareBreakdown30d.length > 0 ? (
                            data.shareBreakdown30d.map((share) => (
                                <div key={share.network} className='space-y-2'>
                                    <div className='flex items-center justify-between text-sm'>
                                        <p>{share.label}</p>
                                        <p className='font-medium text-foreground'>
                                            {formatNumber(share.value)}
                                        </p>
                                    </div>
                                    <div className='h-2 rounded-full bg-muted/60'>
                                        <div
                                            className='h-full rounded-full bg-foreground'
                                            style={{
                                                width: `${data.totalShares30d === 0 ? 0 : (share.value / data.totalShares30d) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                Share tracking will populate as readers use the article share controls.
                            </p>
                        )}
                    </div>
                </div>

                <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                    <p className='text-sm font-medium'>Comments velocity in the first 48h</p>
                    <div className='mt-3 space-y-3'>
                        {topVelocityPosts.length > 0 ? (
                            topVelocityPosts.map((post) => (
                                <div
                                    key={post.slug}
                                    className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                                    <div className='min-w-0'>
                                        <p className='truncate font-medium'>{post.title}</p>
                                        <p className='text-sm text-muted-foreground'>
                                            {post.comments48h} comments in the first 48 hours
                                        </p>
                                    </div>
                                    <p className='shrink-0 text-sm font-medium text-foreground'>
                                        {post.commentsVelocityPerHour}/hr
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                No first-48-hour comment bursts yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function OrganicCard({ data }: AnalyticsDashboardSectionProps) {
    const latestOrganicVisits = data.organicTrend90d[data.organicTrend90d.length - 1]?.value ?? 0;
    const totalOrganicVisits = data.organicTrend90d.reduce((sum, point) => sum + point.value, 0);

    return (
        <Card
            title='SEO & Growth'
            description='Organic search trend over the last 90 days, plus the keyword fragments still available from search referrers.'
            className='xl:col-span-5'>
            <div className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                        <Search className='h-4 w-4 text-muted-foreground' />
                        <p className='mt-3 text-3xl font-semibold'>
                            {formatCompactNumber(totalOrganicVisits)}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>
                            Organic visits over the last 90d
                        </p>
                    </div>
                    <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                        <ChartNoAxesColumn className='h-4 w-4 text-muted-foreground' />
                        <p className='mt-3 text-3xl font-semibold'>{formatNumber(latestOrganicVisits)}</p>
                        <p className='mt-1 text-sm text-muted-foreground'>Most recent day on record</p>
                    </div>
                </div>
                <LineChart points={data.organicTrend90d} gradientId='organic-trend-fill' />
                <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                    <p className='text-sm font-medium'>Top keywords driving traffic</p>
                    <div className='mt-3 space-y-3'>
                        {data.topKeywords90d.length > 0 ? (
                            data.topKeywords90d.map((keyword) => (
                                <div
                                    key={keyword.keyword}
                                    className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
                                    <p className='text-sm text-foreground'>{keyword.keyword}</p>
                                    <p className='text-sm font-medium text-muted-foreground'>
                                        {formatNumber(keyword.visits)} visits
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                Search engines are exposing very little query data right now, so this list will stay sparse until referrers include keywords.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function TopPostsCard({ data }: AnalyticsDashboardSectionProps) {
    return (
        <Card
            title='Top Posts'
            description='Separate leaders for the last 30 days and all-time, followed by a detailed table that combines traffic and quality metrics.'
            className='md:col-span-2 xl:col-span-12'>
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

                <div className='grid gap-3 xl:hidden'>
                    {data.topPosts.length > 0 ? (
                        data.topPosts.map((post) => (
                            <article
                                key={`mobile-${post.slug}`}
                                className='rounded-[22px] border border-border/70 bg-background/60 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)]'>
                                <div className='space-y-2'>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className='inline-flex max-w-full items-center gap-2 font-medium text-foreground transition-colors hover:text-orange-600'>
                                        <span className='truncate'>{post.title}</span>
                                        <ArrowRight className='h-4 w-4 shrink-0' />
                                    </Link>
                                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                                        {post.description}
                                    </p>
                                </div>
                                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                                    <div className='rounded-2xl border border-border/60 bg-background/70 p-3'>
                                        <p className='text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
                                            30d Views
                                        </p>
                                        <p className='mt-2 text-xl font-semibold'>
                                            {formatNumber(post.views30d)}
                                        </p>
                                    </div>
                                    <div className='rounded-2xl border border-border/60 bg-background/70 p-3'>
                                        <p className='text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
                                            All-time Views
                                        </p>
                                        <p className='mt-2 text-xl font-semibold'>
                                            {formatNumber(post.viewsAllTime)}
                                        </p>
                                    </div>
                                </div>
                                <div className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                                    <div>
                                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                            Unique 30d
                                        </p>
                                        <p className='mt-1 text-sm font-medium text-foreground'>
                                            {formatNumber(post.uniqueVisitors30d)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                            Engagement
                                        </p>
                                        <p className='mt-1 text-sm font-medium text-foreground'>
                                            {formatDuration(post.avgEngagementSeconds)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                            Bounce
                                        </p>
                                        <p className='mt-1 text-sm font-medium text-foreground'>
                                            {formatPercent(post.bounceRate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                            Reactions
                                        </p>
                                        <p className='mt-1 text-sm font-medium text-foreground'>
                                            {formatNumber(post.reactions)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                            Comments
                                        </p>
                                        <p className='mt-1 text-sm font-medium text-foreground'>
                                            {formatNumber(post.comments)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                            Shares 30d
                                        </p>
                                        <p className='mt-1 text-sm font-medium text-foreground'>
                                            {formatNumber(post.shares30d)}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className='rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
                            Post rankings will appear after article visits are recorded.
                        </div>
                    )}
                </div>

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
                            {data.topPosts.length > 0 ? (
                                data.topPosts.map((post) => (
                                    <tr
                                        key={post.slug}
                                        className='rounded-2xl bg-background/60 text-sm shadow-[0_8px_30px_rgba(15,23,42,0.05)]'>
                                        <td className='rounded-l-2xl border border-border/70 border-r-0 px-4 py-4 align-top'>
                                            <div className='space-y-1'>
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className='inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-orange-600'>
                                                    {post.title}
                                                    <ArrowRight className='h-4 w-4' />
                                                </Link>
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
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className='rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
                                        Post rankings will appear after article visits are recorded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
}
