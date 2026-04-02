import { Coffee } from 'lucide-react';
import { siteConfig } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuyMeACoffeeButtonProps {
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    label?: string;
}

export function BuyMeACoffeeButton({
    className,
    size = 'default',
    variant = 'default',
    label = 'Buy me a coffee',
}: BuyMeACoffeeButtonProps) {
    return (
        <Button asChild size={size} variant={variant} className={cn('gap-2', className)}>
            <a href={siteConfig.buyMeACoffeeUrl} target='_blank' rel='noopener noreferrer'>
                <Coffee className='h-4 w-4' aria-hidden='true' />
                <span>{label}</span>
            </a>
        </Button>
    );
}
