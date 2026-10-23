/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cn } from '@/lib/utils';
import { promoAds } from '@/lib/ads';
import type { PromoContentProps } from '@/types/components/promo-content';

function getPromoAd(articleKey: string) {
    if (promoAds.length === 0) return undefined;
    const index = Array.from(articleKey).reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0,
    );
    return promoAds[index % promoAds.length];
}

export function PromoContent({
    variant = 'desktop',
    className,
    rotationKey = 'article-promo',
}: PromoContentProps) {
    const ad = getPromoAd(rotationKey);
    if (!ad) return null;

    if (variant === 'mobile') {
        return (
            <div className={cn('border-t border-border bg-muted/20 p-3', className)}>
                <div className='flex items-center gap-3'>
                    <img
                        src={ad.image}
                        alt={ad.imageAlt}
                        className='h-11 w-11 rounded-md object-cover shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-foreground/90 truncate'>
                            {ad.title}
                        </p>
                        <p className='text-xs text-muted-foreground truncate'>{ad.description}</p>
                        <a
                            href={`tel:${ad.phone}`}
                            className='mt-1 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline'
                            onClick={(event) => event.stopPropagation()}
                        >
                            Call {ad.phone}
                        </a>
                    </div>
                    <a
                        href={ad.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`Message ${ad.phone} on WhatsApp about ${ad.title}`}
                        className='shrink-0 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2'
                        onClick={(event) => event.stopPropagation()}
                    >
                        WhatsApp
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'group overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md',
                className,
            )}
        >
            <img
                src={ad.image}
                alt={ad.imageAlt}
                className='h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
            />
            <div className='space-y-4 p-4'>
                <div className='space-y-1.5'>
                    <h3 className='text-base font-semibold leading-snug tracking-tight'>
                        {ad.title}
                    </h3>
                    <p className='line-clamp-3 min-h-15 text-sm leading-relaxed text-muted-foreground'>
                        {ad.description}
                    </p>
                </div>
                <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>Contact us directly</p>
                    <div className='grid grid-cols-2 gap-2'>
                        <a
                            href={`tel:${ad.phone}`}
                            aria-label={`Call ${ad.phone}`}
                            className='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        >
                            <span aria-hidden='true'>☎</span> Call
                        </a>
                        <a
                            href={ad.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label={`Message ${ad.phone} on WhatsApp about ${ad.title}`}
                            className='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2'
                        >
                            <span aria-hidden='true'>◉</span> WhatsApp
                        </a>
                    </div>
                    <p className='text-center text-xs text-muted-foreground'>{ad.phone}</p>
                </div>
            </div>
        </div>
    );
}
