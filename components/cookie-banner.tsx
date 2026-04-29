'use client';

import * as React from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCookieConsent, setCookieConsent, type CookieConsentStatus } from '@/lib/cookie-consent';

export function CookieBanner() {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        setIsVisible(getCookieConsent() === null);
    }, []);

    const handleConsent = (status: CookieConsentStatus) => {
        setCookieConsent(status);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <section
            aria-label='Cookie preferences'
            className='fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl shadow-black/10 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md'
        >
            <div className='flex items-start gap-3'>
                <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground'>
                    <Cookie className='h-4 w-4' aria-hidden='true' />
                </div>

                <div className='min-w-0 flex-1 space-y-3'>
                    <div className='space-y-1'>
                        <h2 className='text-sm font-semibold tracking-tight'>Cookie preferences</h2>
                        <p className='text-sm leading-6 text-muted-foreground'>
                            We use cookies and lightweight analytics to remember preferences and
                            understand what helps readers.
                        </p>
                    </div>

                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                        <Link
                            href='/privacy#cookies-and-analytics'
                            className='rounded-sm text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                        >
                            Settings
                        </Link>

                        <div className='flex gap-2'>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => handleConsent('rejected')}
                            >
                                Reject
                            </Button>
                            <Button
                                type='button'
                                size='sm'
                                onClick={() => handleConsent('accepted')}
                            >
                                Accept
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
