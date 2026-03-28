import type React from 'react';
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
import { cn } from '@/lib/utils';
import type {
    AnalyticsTimeseriesPoint,
    DashboardAnalytics,
} from '@/types/analytics';

const numberFormatter = new Intl.NumberFormat('en-US');
const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const sourceColors: Record<string, string> = {
    direct: '#0f766e',
    organic: '#ea580c',
    social: '#2563eb',
    referral: '#7c3aed',
    new: '#ea580c',
    returning: '#0f766e',
};

interface AnalyticsDashboardProps {
    data: DashboardAnalytics;
}

interface CardProps {
    title: string;
    description: string;
    className?: string;
    children: React.ReactNode;
}

interface DonutSegment {
    label: string;
    value: number;
    color: string;
}

const formatNumber = (value: number): string => numberFormatter.format(value);

const formatCompactNumber = (value: number): string => compactNumberFormatter.format(value);

const formatPercent = (value: number): string => `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;

const formatDelta = (value: number | null): string =>
    value === null ? 'No prior data' : `${value >= 0 ? '+' : ''}${formatPercent(value)}`;

const formatDuration = (value: number): string => {
    if (value < 60) {
        return `${value}s`;
    }

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    if (minutes < 60) {
        return `${minutes}m ${seconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
};

const formatSourceShare = (value: number, total: number): string =>
    total === 0 ? '0%' : formatPercent((value / total) * 100);

const buildPath = (points: Array<{ x: number; y: number }>): string =>
    points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ');

const buildChartPoints = (
    points: AnalyticsTimeseriesPoint[],
    width: number,
    height: number,
    padding: number,
): Array<{ x: number; y: number }> => {
    if (points.length === 0) {
        return [];
    }

    const maxValue = Math.max(...points.map((point) => point.value), 1);
    const minValue = Math.min(...points.map((point) => point.value), 0);
    const valueRange = Math.max(maxValue - minValue, 1);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return points.map((point, index) => ({
        x: padding + (chartWidth * index) / Math.max(points.length - 1, 1),
        y: padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight,
    }));
};

function Card({ title, description, className, children }: CardProps) {
    return (
        <section
            className={cn(
                'rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6',
                className,
            )}>
            <div className='mb-5 flex items-start justify-between gap-4'>
                <div className='space-y-1'>
                    <h2 className='text-lg font-semibold tracking-tight text-foreground'>{title}</h2>
                    <p className='max-w-2xl text-sm text-muted-foreground'>{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function Sparkline({
    points,
    height = 96,
}: {
    points: AnalyticsTimeseriesPoint[];
    height?: number;
}) {
    const width = 320;
    const padding = 10;
    const chartPoints = buildChartPoints(points, width, height, padding);

    if (chartPoints.length === 0) {
        return <div className='h-24 rounded-2xl bg-muted/40' />;
    }

    const linePath = buildPath(chartPoints);
    const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1]?.x ?? 0} ${height - padding} L ${
        chartPoints[0]?.x ?? 0
    } ${height - padding} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className='h-24 w-full'>
            <defs>
                <linearGradient id='sparkline-fill' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#ea580c' stopOpacity='0.35' />
                    <stop offset='100%' stopColor='#ea580c' stopOpacity='0' />
                </linearGradient>
            </defs>
            <path d={areaPath} fill='url(#sparkline-fill)' />
            <path
                d={linePath}
                fill='none'
                stroke='#ea580c'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2.5'
            />
        </svg>
    );
}

function LineChart({
    points,
}: {
    points: AnalyticsTimeseriesPoint[];
}) {
    const width = 540;
    const height = 220;
    const padding = 18;
    const chartPoints = buildChartPoints(points, width, height, padding);
    const maxValue = Math.max(...points.map((point) => point.value), 1);
    const yAxisValues = [maxValue, Math.round(maxValue / 2), 0];

    if (chartPoints.length === 0) {
        return <div className='h-[220px] rounded-3xl bg-muted/40' />;
    }

    const linePath = buildPath(chartPoints);
    const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1]?.x ?? 0} ${height - padding} L ${
        chartPoints[0]?.x ?? 0
    } ${height - padding} Z`;

    return (
        <div className='space-y-3'>
            <svg viewBox={`0 0 ${width} ${height}`} className='h-[220px] w-full'>
                <defs>
                    <linearGradient id='line-fill' x1='0' x2='0' y1='0' y2='1'>
                        <stop offset='0%' stopColor='#0f766e' stopOpacity='0.3' />
                        <stop offset='100%' stopColor='#0f766e' stopOpacity='0' />
                    </linearGradient>
                </defs>
                {yAxisValues.map((value, index) => {
                    const y = padding + ((height - padding * 2) * index) / (yAxisValues.length - 1);

                    return (
                        <line
                            key={value}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke='currentColor'
                            strokeDasharray='4 6'
                            className='text-border/70'
                        />
                    );
                })}
                <path d={areaPath} fill='url(#line-fill)' />
                <path
                    d={linePath}
                    fill='none'
                    stroke='#0f766e'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='3'
                />
            </svg>
            <div className='grid grid-cols-3 gap-2 text-xs text-muted-foreground sm:grid-cols-6'>
                {points.filter((_, index) => index % Math.ceil(points.length / 6) === 0).map((point) => (
                    <div key={point.date}>
                        <p className='font-medium text-foreground'>{point.label}</p>
                        <p>{formatNumber(point.value)} visits</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutChart({
    segments,
    centerLabel,
    centerSubLabel,
}: {
    segments: DonutSegment[];
    centerLabel: string;
    centerSubLabel: string;
}) {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    if (total === 0) {
        return (
            <div className='flex h-44 w-44 items-center justify-center rounded-full border border-dashed border-border bg-muted/20 text-center'>
                <div>
                    <p className='text-lg font-semibold'>0</p>
                    <p className='text-xs text-muted-foreground'>No data yet</p>
                </div>
            </div>
        );
    }

    let currentOffset = 0;
    const gradient = segments
        .map((segment) => {
            const start = currentOffset;
            const end = currentOffset + (segment.value / total) * 100;
            currentOffset = end;
            return `${segment.color} ${start}% ${end}%`;
        })
        .join(', ');

    return (
        <div
            className='relative flex h-44 w-44 items-center justify-center rounded-full'
            style={{
                backgroundImage: `conic-gradient(${gradient})`,
            }}>
            <div className='flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner'>
                <p className='text-2xl font-semibold'>{centerLabel}</p>
                <p className='text-xs text-muted-foreground'>{centerSubLabel}</p>
            </div>
        </div>
    );
}

function ViewsCard({ data }: AnalyticsDashboardProps) {
    return (
        <Card
            title='Traffic & Reach'
            description='Pageviews across the last 7, 30, and 90 days, with a quick signal for how the current month compares to the previous one.'
            className='lg:col-span-2'>
            <div className='grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]'>
                <div className='space-y-5 rounded-[24px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(234,88,12,0.12),rgba(234,88,12,0.02)_55%,rgba(255,255,255,0))] p-5'>
                    <div className='flex flex-wrap items-start justify-between gap-4'>
                        <div>
                            <p className='text-sm font-medium uppercase tracking-[0.24em] text-orange-600'>
                                30d Views
                            </p>
                            <div className='mt-3 flex flex-wrap items-end gap-3'>
                                <p className='text-5xl font-semibold tracking-tight'>
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
                        <div className='rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-right'>
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

                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-1'>
                    {data.periods.map((period) => (
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
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

function AudienceCard({ data }: AnalyticsDashboardProps) {
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
            description='Unique reader counts and how much of the current month is driven by fresh discovery versus repeat attention.'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-center'>
                <DonutChart
                    segments={audienceSegments}
                    centerLabel={formatNumber(data.uniqueVisitors30d)}
                    centerSubLabel='visitors'
                />
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

function SourcesCard({ data }: AnalyticsDashboardProps) {
    const totalSources = data.sources30d.reduce((sum, source) => sum + source.value, 0);
    const sourceSegments = data.sources30d.map((source) => ({
        label: source.label,
        value: source.value,
        color: sourceColors[source.key] ?? '#64748b',
    }));

    return (
        <Card
            title='Traffic Sources'
            description='Where article readers are coming from over the last 30 days, including the strongest channel details inside each bucket.'
            className='lg:col-span-2'>
            <div className='grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]'>
                <DonutChart
                    segments={sourceSegments}
                    centerLabel={formatNumber(totalSources)}
                    centerSubLabel='30d visits'
                />
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
                                        <div key={detail.label} className='flex items-center justify-between gap-3'>
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
        </Card>
    );
}

function EngagementCard({ data }: AnalyticsDashboardProps) {
    return (
        <Card
            title='Engagement Quality'
            description='Average engaged time, bounce rate, and the share of readers reaching meaningful scroll milestones.'>
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
                        <p className='mt-3 text-3xl font-semibold'>{formatPercent(data.bounceRate30d)}</p>
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
                    {[
                        { label: 'Reached 50%', value: data.scrollReach30d.reached50, color: '#0f766e' },
                        { label: 'Reached 75%', value: data.scrollReach30d.reached75, color: '#ea580c' },
                        { label: 'Reached 100%', value: data.scrollReach30d.reached100, color: '#2563eb' },
                    ].map((item) => (
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
        </Card>
    );
}

function ViralityCard({ data }: AnalyticsDashboardProps) {
    const topVelocityPosts = [...data.topPosts]
        .sort((left, right) => right.comments48h - left.comments48h)
        .filter((post) => post.comments48h > 0)
        .slice(0, 3);

    return (
        <Card
            title='Social & Virality'
            description='Share actions, interaction density, and early comment momentum within the first 48 hours after publishing.'
            className='lg:col-span-2'>
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
                            {data.avgInteractionsPerPost.toFixed(data.avgInteractionsPerPost % 1 === 0 ? 0 : 1)}
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
                                <div key={post.slug} className='flex items-start justify-between gap-4'>
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

function OrganicCard({ data }: AnalyticsDashboardProps) {
    const latestOrganicVisits = data.organicTrend90d[data.organicTrend90d.length - 1]?.value ?? 0;

    return (
        <Card
            title='SEO & Growth'
            description='Organic search trend over the last 90 days, plus the keyword fragments still available from search referrers.'>
            <div className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                        <Search className='h-4 w-4 text-muted-foreground' />
                        <p className='mt-3 text-3xl font-semibold'>
                            {formatCompactNumber(
                                data.organicTrend90d.reduce((sum, point) => sum + point.value, 0),
                            )}
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
                <LineChart points={data.organicTrend90d} />
                <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                    <p className='text-sm font-medium'>Top keywords driving traffic</p>
                    <div className='mt-3 space-y-3'>
                        {data.topKeywords90d.length > 0 ? (
                            data.topKeywords90d.map((keyword) => (
                                <div key={keyword.keyword} className='flex items-center justify-between gap-4'>
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

function TopPostsCard({ data }: AnalyticsDashboardProps) {
    return (
        <Card
            title='Top Posts'
            description='Ranked by the last 30 days of article views, with all-time reach and quality signals alongside each post.'
            className='lg:col-span-3'>
            <div className='overflow-x-auto'>
                <table className='min-w-full border-separate border-spacing-y-3'>
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
                                <td colSpan={9} className='rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
                                    Post rankings will appear after article visits are recorded.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    return (
        <div className='space-y-6'>
            <header className='rounded-[30px] border border-border/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(37,99,235,0.06)_45%,rgba(234,88,12,0.08)_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur'>
                <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
                    <div className='space-y-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground'>
                            Admin Dashboard
                        </p>
                        <div>
                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                Blog analytics that actually help you make decisions
                            </h1>
                            <p className='mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base'>
                                Traffic, engagement, source attribution, SEO lift, and social velocity,
                                all scoped to the articles that matter most.
                            </p>
                        </div>
                    </div>
                    <div className='rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground'>
                        Updated {dateTimeFormatter.format(new Date(data.generatedAt))}
                    </div>
                </div>
            </header>

            <div className='grid gap-6 lg:grid-cols-3'>
                <ViewsCard data={data} />
                <AudienceCard data={data} />
                <SourcesCard data={data} />
                <EngagementCard data={data} />
                <ViralityCard data={data} />
                <TopPostsCard data={data} />
                <OrganicCard data={data} />
            </div>
        </div>
    );
}
