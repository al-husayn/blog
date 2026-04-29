'use client';

import { ArrowRight, Share2, Users } from 'lucide-react';
import { Card } from '@/components/admin/analytics-dashboard-primitives';
import { formatCompactNumber, formatNumber } from '@/components/admin/analytics-dashboard-utils';
import { ProgressRow } from '@/components/admin/analytics-dashboard-sections/progress-row';
import { SectionMetricCard } from '@/components/admin/analytics-dashboard-sections/section-metric-card';
import type { AnalyticsDashboardSectionProps } from '@/components/admin/analytics-dashboard-sections/types';

export function ViralityCard({ data }: AnalyticsDashboardSectionProps) {
    const topVelocityPosts = [...data.topPosts]
        .sort((left, right) => right.comments48h - left.comments48h)
        .filter((post) => post.comments48h > 0)
        .slice(0, 3);

    return (
        <Card
            title='Social & Virality'
            description='Share actions, interaction density, and early comment momentum within the first 48 hours after publishing.'
            className='md:col-span-2 xl:col-span-7'
        >
            <div className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-3'>
                    <SectionMetricCard
                        icon={<Share2 className='h-4 w-4 text-muted-foreground' />}
                        value={formatCompactNumber(data.totalShares30d)}
                        label='Shares in the last 30d'
                    />
                    <SectionMetricCard
                        icon={<Users className='h-4 w-4 text-muted-foreground' />}
                        value={formatCompactNumber(data.totalReactionsAllTime)}
                        label='All-time reactions, comments, and shares'
                    />
                    <SectionMetricCard
                        icon={<ArrowRight className='h-4 w-4 text-muted-foreground' />}
                        value={data.avgInteractionsPerPost.toFixed(
                            data.avgInteractionsPerPost % 1 === 0 ? 0 : 1,
                        )}
                        label='Avg interactions per post'
                    />
                </div>

                <div className='rounded-2xl border border-border/70 bg-background/60 p-4'>
                    <p className='text-sm font-medium'>Share breakdown</p>
                    <div className='mt-3 space-y-3'>
                        {data.shareBreakdown30d.length > 0 ? (
                            data.shareBreakdown30d.map((share) => (
                                <ProgressRow
                                    key={share.network}
                                    label={share.label}
                                    valueLabel={formatNumber(share.value)}
                                    percent={
                                        data.totalShares30d === 0
                                            ? 0
                                            : (share.value / data.totalShares30d) * 100
                                    }
                                />
                            ))
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                Share tracking will populate as readers use the article share
                                controls.
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
                                    className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'
                                >
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
