'use client';

import {
    Check,
    Copy,
    Facebook,
    Linkedin,
    MessageCircleMore,
    Share2,
    Twitter,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { Button } from '@/components/ui/button';
import type { ArticleShareProps } from '@/types/components/article-share';

const COPY_RESET_DELAY_MS = 2000;

const createShareLinks = ({ title, description, url }: ArticleShareProps) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedMessage = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);

    return [
        {
            label: 'X',
            href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            icon: Twitter,
        },
        {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: Linkedin,
        },
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: Facebook,
        },
        {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodedMessage}`,
            icon: MessageCircleMore,
        },
    ] as const;
};

export function ArticleShare({ title, description, url }: ArticleShareProps) {
    const [hasCopied, setHasCopied] = useState(false);
    const [nativeShareAvailable, setNativeShareAvailable] = useState(false);
    const [shareError, setShareError] = useState<string | null>(null);
    const copyTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setNativeShareAvailable(typeof navigator !== 'undefined' && typeof navigator.share === 'function');

        return () => {
            if (copyTimeoutRef.current) {
                window.clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    const handleCopy = async () => {
        try {
            await copyTextToClipboard(url);
            setShareError(null);
            setHasCopied(true);

            if (copyTimeoutRef.current) {
                window.clearTimeout(copyTimeoutRef.current);
            }

            copyTimeoutRef.current = window.setTimeout(() => {
                setHasCopied(false);
                copyTimeoutRef.current = null;
            }, COPY_RESET_DELAY_MS);
        } catch {
            setShareError('We could not copy the article link. Please try again.');
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
            setShareError(null);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            setShareError('Native sharing is not available right now. You can still copy the link.');
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
                        <Button type='button' variant='secondary' size='sm' onClick={handleNativeShare}>
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
                                aria-label={`Share this article on ${link.label}`}>
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

            {shareError && <p className='mt-3 text-xs text-destructive'>{shareError}</p>}
        </section>
    );
}
