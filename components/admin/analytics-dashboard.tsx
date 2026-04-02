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
    DashboardTopPostMetric,
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
                'min-w-0 rounded-[24px] border border-border/70 bg-card/95 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[28px] sm:p-6',
                className,
            )}>
            <div className='mb-4 flex items-start justify-between gap-4 sm:mb-5'>
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
    stroke = '#ea580c',
    gradientId = 'sparkline-fill',
}: {
    points: AnalyticsTimeseriesPoint[];
    height?: number;
    stroke?: string;
    gradientId?: string;
}) {
    const width = 320;
    const padding = 10;
    const chartPoints = buildChartPoints(points, width, height, padding);

    if (chartPoints.length === 0) {
        return <div className='h-20 rounded-2xl bg-muted/40 sm:h-24' />;
    }

    const linePath = buildPath(chartPoints);
    const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1]?.x ?? 0} ${height - padding} L ${
        chartPoints[0]?.x ?? 0
    } ${height - padding} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className='h-full w-full'>
            <defs>
                <linearGradient id={gradientId} x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor={stroke} stopOpacity='0.35' />
                    <stop offset='100%' stopColor={stroke} stopOpacity='0' />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
                d={linePath}
                fill='none'
                stroke={stroke}
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
    const labelStep = Math.max(1, Math.ceil(points.length / 6));
    const sampledPoints = points.filter((_, index) => index % labelStep === 0);
    const finalSampledPoints =
        points.length > 0 && sampledPoints[sampledPoints.length - 1]?.date !== points[points.length - 1]?.date
            ? [...sampledPoints, points[points.length - 1]!]
            : sampledPoints;

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
                            key={`${value}-${index}`}
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
            <div className='grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3 xl:grid-cols-6'>
                {finalSampledPoints.map((point) => (
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
            <div className='flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-border bg-muted/20 text-center sm:h-44 sm:w-44'>
                <div>
                    <p className='text-lg font-semibold sm:text-xl'>0</p>
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
            className='relative flex h-36 w-36 items-center justify-center rounded-full sm:h-44 sm:w-44'
            style={{
                backgroundImage: `conic-gradient(${gradient})`,
            }}>
            <div className='flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner sm:h-28 sm:w-28'>
                <p className='text-xl font-semibold sm:text-2xl'>{centerLabel}</p>
                <p className='text-xs text-muted-foreground'>{centerSubLabel}</p>
            </div>
        </div>
    );
}

function EngagementGauge({
    score,
    label,
}: {
    score: number;
    label: string;
}) {
    const clampedScore = Math.min(100, Math.max(0, score));

    return (
        <div className='flex flex-col items-center gap-4'>
            <div
                className='relative flex h-36 w-36 items-center justify-center rounded-full sm:h-44 sm:w-44'
                style={{
                    backgroundImage: `conic-gradient(#ea580c 0% ${clampedScore}%, rgba(148,163,184,0.15) ${clampedScore}% 100%)`,
                }}>
                <div className='flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner sm:h-[7.5rem] sm:w-[7.5rem]'>
                    <p className='text-3xl font-semibold tracking-tight sm:text-4xl'>{clampedScore}</p>
                    <p className='text-xs uppercase tracking-[0.22em] text-muted-foreground'>Score</p>
                </div>
            </div>
            <p className='text-sm text-muted-foreground'>{label}</p>
        </div>
    );
}

function LeaderboardList({
    title,
    posts,
    metricLabel,
    metricValue,
}: {
    title: string;
    posts: DashboardTopPostMetric[];
    metricLabel: string;
    metricValue: (post: DashboardTopPostMetric) => string;
}) {
    return (
        <div className='rounded-[22px] border border-border/70 bg-background/60 p-4 sm:rounded-[24px] sm:p-5'>
            <div className='mb-4 flex items-center justify-between gap-3'>
                <h3 className='text-base font-semibold tracking-tight'>{title}</h3>
                <p className='hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:block'>
                    {metricLabel}
                </p>
            </div>
            <div className='space-y-3'>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div
                            key={`${title}-${post.slug}`}
                            className='rounded-2xl border border-border/60 bg-background/70 p-3'>
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground'>
                                    {index + 1}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className='inline-flex max-w-full items-center gap-2 font-medium text-foreground transition-colors hover:text-orange-600'>
                                        <span className='truncate'>{post.title}</span>
                                        <ArrowRight className='h-4 w-4 shrink-0' />
                                    </Link>
                                    <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                                        {post.description}
                                    </p>
                                </div>
                                <div className='flex items-center justify-between gap-3 sm:block sm:shrink-0 sm:text-right'>
                                    <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:hidden'>
                                        {metricLabel}
                                    </p>
                                    <p className='text-base font-semibold'>{metricValue(post)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='text-sm text-muted-foreground'>Post rankings will appear after analytics data arrives.</p>
                )}
            </div>
        </div>
    );
}

function ViewsCard({ data }: AnalyticsDashboardProps) {
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
            </div>
        </Card>
    );
}

function EngagementCard({ data }: AnalyticsDashboardProps) {
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

function OrganicCard({ data }: AnalyticsDashboardProps) {
    const latestOrganicVisits = data.organicTrend90d[data.organicTrend90d.length - 1]?.value ?? 0;

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

function TopPostsCard({ data }: AnalyticsDashboardProps) {
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
                                    <td colSpan={9} className='rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
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

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    return (
        <div className='space-y-5 sm:space-y-6'>
            <header className='rounded-[26px] border border-border/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(37,99,235,0.06)_45%,rgba(234,88,12,0.08)_100%)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:rounded-[30px] sm:p-6 lg:p-8'>
                <div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
                    <div className='space-y-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground'>
                            Admin Dashboard
                        </p>
                        <div>
                            <h1 className='max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl'>
                                Blog analytics that actually help you make decisions
                            </h1>
                            <p className='mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base'>
                                Traffic, engagement, source attribution, SEO lift, and social velocity,
                                all scoped to the articles that matter most.
                            </p>
                        </div>
                    </div>
                    <div className='w-full rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground sm:w-fit'>
                        Updated {dateTimeFormatter.format(new Date(data.generatedAt))}
                    </div>
                </div>
            </header>

            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-12 xl:gap-6'>
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
