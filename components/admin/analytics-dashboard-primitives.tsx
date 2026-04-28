'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsTimeseriesPoint, DashboardTopPostMetric } from '@/types/analytics';
import {
    buildChartPoints,
    buildPath,
    formatNumber,
} from '@/components/admin/analytics-dashboard-utils';

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

export function Card({ title, description, className, children }: CardProps) {
    return (
        <section
            className={cn(
                'min-w-0 rounded-[24px] border border-border/70 bg-card/95 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[28px] sm:p-6',
                className,
            )}
        >
            <div className='mb-4 flex items-start justify-between gap-4 sm:mb-5'>
                <div className='space-y-1'>
                    <h2 className='text-lg font-semibold tracking-tight text-foreground'>
                        {title}
                    </h2>
                    <p className='max-w-2xl text-sm text-muted-foreground'>{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

export function Sparkline({
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

export function LineChart({
    points,
    gradientId = 'line-fill',
}: {
    points: AnalyticsTimeseriesPoint[];
    gradientId?: string;
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
        points.length > 0 &&
        sampledPoints[sampledPoints.length - 1]?.date !== points[points.length - 1]?.date
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
                    <linearGradient id={gradientId} x1='0' x2='0' y1='0' y2='1'>
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
                <path d={areaPath} fill={`url(#${gradientId})`} />
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

export function DonutChart({
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
            }}
        >
            <div className='flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner sm:h-28 sm:w-28'>
                <p className='text-xl font-semibold sm:text-2xl'>{centerLabel}</p>
                <p className='text-xs text-muted-foreground'>{centerSubLabel}</p>
            </div>
        </div>
    );
}

export function EngagementGauge({ score, label }: { score: number; label: string }) {
    const clampedScore = Math.min(100, Math.max(0, score));

    return (
        <div className='flex flex-col items-center gap-4'>
            <div
                className='relative flex h-36 w-36 items-center justify-center rounded-full sm:h-44 sm:w-44'
                style={{
                    backgroundImage: `conic-gradient(#ea580c 0% ${clampedScore}%, rgba(148,163,184,0.15) ${clampedScore}% 100%)`,
                }}
            >
                <div className='flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner sm:h-[7.5rem] sm:w-[7.5rem]'>
                    <p className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                        {clampedScore}
                    </p>
                    <p className='text-xs uppercase tracking-[0.22em] text-muted-foreground'>
                        Score
                    </p>
                </div>
            </div>
            <p className='text-sm text-muted-foreground'>{label}</p>
        </div>
    );
}

export function LeaderboardList({
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
                            className='rounded-2xl border border-border/60 bg-background/70 p-3'
                        >
                            <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground'>
                                    {index + 1}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className='inline-flex max-w-full items-center gap-2 font-medium text-foreground transition-colors hover:text-orange-600'
                                    >
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
                    <p className='text-sm text-muted-foreground'>
                        Post rankings will appear after analytics data arrives.
                    </p>
                )}
            </div>
        </div>
    );
}
