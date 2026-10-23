/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cn } from '@/lib/utils';
import { promoAds } from '@/lib/ads';
import type { PromoContentProps } from '@/types/components/promo-content';

function getPromoAd(articleKey: string) {
    if (promoAds.length === 0) return undefined;
    const index = Array.from(articleKey).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return promoAds[index % promoAds.length];
}

export function PromoContent({ variant = 'desktop', className, rotationKey = 'article-promo' }: PromoContentProps) {
    const ad = getPromoAd(rotationKey);
    if (!ad) return null;

    if (variant === 'mobile') {
        return (
            <div className={cn('border-t border-border bg-muted/20 p-3', className)}>
                <div className='flex items-center gap-3'>
                    <img
                        src={ad.image}
                        alt={ad.imageAlt}
                        className='w-8 h-8 rounded object-cover shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-foreground/90 truncate'>{ad.title}</p>
                        <p className='text-xs text-muted-foreground truncate'>{ad.description}</p>
                    </div>
                    <a
                        href={ad.href}
                        className='text-xs text-primary hover:text-primary/80 font-medium'
                        onClick={(event) => event.stopPropagation()}
                    >
                        View ad
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('border border-border rounded-lg p-4 bg-card', className)}>
            <a href={ad.href} className='flex flex-col gap-4' aria-label={`View ad: ${ad.title}`}>
                <img src={ad.image} alt={ad.imageAlt} className='w-full h-40 rounded-md object-cover' />
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold tracking-tighter'>{ad.title}</h3>
                    <p className='text-sm text-muted-foreground'>{ad.description}</p>
                </div>
            </a>
        </div>
    );
}
