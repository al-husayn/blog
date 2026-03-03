import React from 'react';
import { cn } from '@/lib/utils';
import type { AdSize } from '@/lib/ads';

interface AdsPlaceholderProps {
    className?: string;
    size?: AdSize;
    title?: string;
    slot?: string;
    description?: string;
}

export function AdsPlaceholder({
    className,
    size = 'medium',
    title = 'Advertisement',
    slot,
    description,
}: AdsPlaceholderProps) {
    const slotConfig = {
        small: {
            wrapper: 'h-28',
            dimensions: '320 x 100',
        },
        medium: {
            wrapper: 'h-48',
            dimensions: '300 x 250',
        },
        large: {
            wrapper: 'h-64',
            dimensions: '336 x 280',
        },
        leaderboard: {
            wrapper: 'h-24 md:h-28',
            dimensions: '728 x 90',
        },
    } as const;

    const activeConfig = slotConfig[size];

    return (
        <aside
            aria-label={slot ? `${title} (${slot})` : title}
            className={cn(
                'rounded-lg border border-dashed border-border bg-muted/30',
                'flex items-center justify-center px-4',
                activeConfig.wrapper,
                className
            )}>
            <div className='text-center space-y-1.5'>
                <div className='text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.16em]'>
                    {title}
                </div>
                <div className='text-xs text-muted-foreground/80'>
                    {description || 'Sponsored placement for partners and community products.'}
                </div>
                <div className='text-[11px] text-muted-foreground/70'>
                    {activeConfig.dimensions}
                    {slot ? ` · Slot: ${slot}` : ''}
                </div>
            </div>
        </aside>
    );
}
