"use client";

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MIN_LONG_ARTICLE_HEIGHT_MULTIPLIER = 1.5;
const MIN_SCROLL_OFFSET = 360;

export function ArticleBackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateVisibility = () => {
            const viewportHeight = window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;
            const isLongArticle = pageHeight > viewportHeight * MIN_LONG_ARTICLE_HEIGHT_MULTIPLIER;
            const hasScrolledFarEnough =
                window.scrollY > Math.max(MIN_SCROLL_OFFSET, viewportHeight * 0.75);
            const nextVisible = isLongArticle && hasScrolledFarEnough;

            setIsVisible((currentValue) =>
                currentValue === nextVisible ? currentValue : nextVisible,
            );
        };

        updateVisibility();
        window.addEventListener('scroll', updateVisibility, { passive: true });
        window.addEventListener('resize', updateVisibility);

        return () => {
            window.removeEventListener('scroll', updateVisibility);
            window.removeEventListener('resize', updateVisibility);
        };
    }, []);

    const handleScrollToTop = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    };

    return (
        <div
            className={cn(
                'fixed bottom-24 left-1/2 z-40 -translate-x-1/2 transition-all duration-200 lg:bottom-6',
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0',
            )}>
            <Button
                type='button'
                size='sm'
                onClick={handleScrollToTop}
                aria-label='Back to top of article'
                className='h-10 rounded-full px-3 shadow-lg sm:px-4'>
                <ArrowUp className='h-4 w-4' />
                <span className='hidden sm:inline'>Back to top</span>
            </Button>
        </div>
    );
}
