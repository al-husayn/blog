'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MIN_LONG_ARTICLE_HEIGHT_MULTIPLIER = 1.5;
const MIN_SCROLL_OFFSET = 360;

export function ArticleBackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let rafId: number | null = null;
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
        const scheduleUpdate = () => {
           if (rafId !== null) return;
           rafId = window.requestAnimationFrame(() => {
               rafId = null;
               updateVisibility();
           });
       };

        updateVisibility();
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);

        return () => {
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
            if (rafId !== null) window.cancelAnimationFrame(rafId);
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
            aria-hidden={!isVisible}
            inert={!isVisible}
            className={cn(
                'fixed bottom-24 left-1/2 z-40 -translate-x-1/2 transition-all duration-200 lg:bottom-6',
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0',
            )}
        >
            <Button
                type='button'
                size='sm'
                onClick={handleScrollToTop}
                tabIndex={isVisible ? 0 : -1}
                aria-label='Back to top of article'
                className='h-10 rounded-full px-3 shadow-lg sm:px-4'
            >
                <ArrowUp className='h-4 w-4' />
                <span className='hidden sm:inline'>Back to top</span>
            </Button>
        </div>
    );
}
