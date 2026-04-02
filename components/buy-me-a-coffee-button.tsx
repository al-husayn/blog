import { ArrowUpRight, Coffee } from 'lucide-react';
import { siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

interface BuyMeACoffeeButtonProps {
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    label?: string;
}

const sizeClasses: Record<NonNullable<BuyMeACoffeeButtonProps['size']>, string> = {
    default: 'min-h-11 px-5 text-sm',
    sm: 'min-h-10 px-4 text-sm',
    lg: 'min-h-12 px-6 text-base',
    icon: 'size-11 px-0',
};

export function BuyMeACoffeeButton({
    className,
    size = 'default',
    label = 'Buy me a coffee',
}: BuyMeACoffeeButtonProps) {
    return (
        <a
            href={siteConfig.buyMeACoffeeUrl}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
                'inline-flex items-center justify-center gap-3 rounded-full border border-black/10 bg-[#ffdd00] font-extrabold tracking-tight text-[#111111] shadow-[0_4px_0_rgba(17,17,17,0.18)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#ffe45c] hover:shadow-[0_6px_0_rgba(17,17,17,0.16)] active:translate-y-0 active:shadow-[0_2px_0_rgba(17,17,17,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdd00] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                sizeClasses[size],
                className,
            )}>
            <span className='inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/95 text-[#111111] shadow-sm'>
                <Coffee className='h-4 w-4' aria-hidden='true' />
            </span>
            {size === 'icon' ? <span className='sr-only'>{label}</span> : <span>{label}</span>}
            <span className='sr-only'>(opens in a new tab)</span>
        </a>
    );
}

interface BuyMeACoffeeBadgeProps {
    className?: string;
    label?: string;
}

export function BuyMeACoffeeBadge({
    className,
    label = 'Buy me a coffee',
}: BuyMeACoffeeBadgeProps) {
    return (
        <a
            href={siteConfig.buyMeACoffeeUrl}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
                'group inline-flex w-fit items-center gap-2.5 rounded-full border border-[#ffdd00]/55 bg-[linear-gradient(135deg,rgba(255,221,0,0.16),rgba(255,255,255,0.92))] px-3.5 py-2 text-left text-foreground shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#ffdd00]/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdd00] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                className,
            )}>
            <span className='inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#ffdd00] text-[#111111] shadow-sm'>
                <Coffee className='h-3.5 w-3.5' aria-hidden='true' />
            </span>
            <span className='text-sm font-semibold tracking-tight'>{label}</span>
            <ArrowUpRight className='h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' aria-hidden='true' />
            <span className='sr-only'>(opens in a new tab)</span>
        </a>
    );
}
