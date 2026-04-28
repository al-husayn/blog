'use client';

import { Check, Copy, Facebook, Linkedin, MessageCircleMore, Share2, Twitter } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { useEffect, useRef, useState } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { reportAnalyticsError, trackArticleShare } from '@/lib/analytics-client';
import { Button } from '@/components/ui/button';
import type { ShareNetwork } from '@/types/analytics';
import type { ArticleShareProps } from '@/types/components/article-share';

const COPY_RESET_DELAY_MS = 2000;
const SHORT_TOAST_TIMING = { displayDuration: 2600 } as const;

const createShareLinks = ({
    title,
    description,
    url,
}: Pick<ArticleShareProps, 'title' | 'description' | 'url'>) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedMessage = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);

    return [
        {
            label: 'X',
            href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            icon: Twitter,
            network: 'x' as const,
        },
        {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: Linkedin,
            network: 'linkedin' as const,
        },
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: Facebook,
            network: 'facebook' as const,
        },
        {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodedMessage}`,
            icon: MessageCircleMore,
            network: 'whatsapp' as const,
        },
    ] as const;
};

export function ArticleShare({ articleSlug, title, description, url }: ArticleShareProps) {
    const [hasCopied, setHasCopied] = useState(false);
    const [nativeShareAvailable, setNativeShareAvailable] = useState(false);
    const copyTimeoutRef = useRef<number | null>(null);

    const trackShare = (network: ShareNetwork) => {
        void trackArticleShare({ articleSlug, network }).catch((error) => {
            reportAnalyticsError(
                `Failed to record share event (${network}) for "${articleSlug}"`,
                error,
            );
        });
    };

    useEffect(() => {
        setNativeShareAvailable(
            typeof navigator !== 'undefined' && typeof navigator.share === 'function',
        );

        return () => {
            if (copyTimeoutRef.current) {
                window.clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    const handleCopy = async () => {
        try {
            await copyTextToClipboard(url);
            trackShare('copy_link');
            setHasCopied(true);
            gooeyToast.success('Link copied', {
                description: 'The article URL is ready to share.',
                timing: SHORT_TOAST_TIMING,
                showTimestamp: false,
            });

            if (copyTimeoutRef.current) {
                window.clearTimeout(copyTimeoutRef.current);
            }

            copyTimeoutRef.current = window.setTimeout(() => {
                setHasCopied(false);
                copyTimeoutRef.current = null;
            }, COPY_RESET_DELAY_MS);
        } catch {
            gooeyToast.error('Could not copy the article link', {
                description: 'Please try again or use one of the share buttons below.',
                showTimestamp: false,
            });
        }
    };

    const handleNativeShare = async () => {
        if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
            return;
        }

        try {
            await navigator.share({
                title,
                text: description,
                url,
            });
            trackShare('native');
            gooeyToast.success('Thanks for sharing', {
                description: 'The article was shared from your device.',
                timing: SHORT_TOAST_TIMING,
                showTimestamp: false,
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            gooeyToast.error('Native sharing is unavailable right now', {
                description: 'You can still copy the link or share with the social buttons below.',
                showTimestamp: false,
            });
        }
    };

    const shareLinks = createShareLinks({ title, description, url });

    return (
        <section className='rounded-2xl border border-border bg-card/80 p-4 shadow-xs backdrop-blur sm:p-5'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                <div className='space-y-1'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                        Share this article
                    </p>
                    <p className='max-w-2xl text-sm text-muted-foreground'>
                        Send it to a friend, your team, or your favorite social feed.
                    </p>
                </div>

                <div className='flex flex-wrap gap-2'>
                    {nativeShareAvailable && (
                        <Button
                            type='button'
                            variant='secondary'
                            size='sm'
                            onClick={handleNativeShare}
                        >
                            <Share2 className='h-4 w-4' />
                            Share
                        </Button>
                    )}

                    {shareLinks.map((link) => (
                        <Button key={link.label} asChild variant='outline' size='sm'>
                            <a
                                href={link.href}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => trackShare(link.network)}
                                aria-label={`Share this article on ${link.label}`}
                            >
                                <link.icon className='h-4 w-4' />
                                {link.label}
                            </a>
                        </Button>
                    ))}

                    <Button type='button' variant='outline' size='sm' onClick={handleCopy}>
                        {hasCopied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                        {hasCopied ? 'Copied' : 'Copy link'}
                    </Button>
                </div>
            </div>
        </section>
    );
}
