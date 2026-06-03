import { ArrowUpRight, Coffee } from 'lucide-react';
import { siteConfig } from '@/lib/site';
import { cn } from '@/lib/utils';

interface BuyMeACoffeeButtonProps {
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    label?: string;
}

const buyMeACoffeeLinkProps = {
    href: siteConfig.buyMeACoffeeUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
} as const;

function ExternalLinkHint() {
    return <span className='sr-only'>(opens in a new tab)</span>;
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
            {...buyMeACoffeeLinkProps}
            className={cn(
                'shadow-coffee-button inline-flex items-center justify-center gap-3 rounded-full border border-coffee-foreground/10 bg-coffee font-extrabold tracking-tight text-coffee-foreground transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-coffee/85 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                sizeClasses[size],
                className,
            )}
        >
            <span className='inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground shadow-sm'>
                <Coffee className='h-4 w-4' aria-hidden='true' />
            </span>
            {size === 'icon' ? <span className='sr-only'>{label}</span> : <span>{label}</span>}
            <ExternalLinkHint />
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
            {...buyMeACoffeeLinkProps}
            className={cn(
                'bg-coffee-badge group inline-flex w-fit items-center gap-2.5 rounded-full border border-coffee/55 px-3.5 py-2 text-left text-foreground shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-coffee/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                className,
            )}
        >
            <span className='inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-coffee text-coffee-foreground shadow-sm'>
                <Coffee className='h-3.5 w-3.5' aria-hidden='true' />
            </span>
            <span className='text-sm font-semibold tracking-tight'>{label}</span>
            <ArrowUpRight
                className='h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                aria-hidden='true'
            />
            <ExternalLinkHint />
        </a>
    );
}
