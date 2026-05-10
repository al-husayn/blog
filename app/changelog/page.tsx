import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Bug, Rocket, Sparkles, Wrench } from 'lucide-react';
import { getChangelogEntries } from '@/lib/changelog';
import { getAbsoluteUrl, toJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import { cn, formatDate } from '@/lib/utils';
import type { ChangelogEntryType } from '@/types/changelog';

export const metadata: Metadata = {
    title: 'Changelog',
    description: `Track product updates, fixes, and improvements for ${siteConfig.name}.`,
    alternates: {
        canonical: '/changelog',
    },
    openGraph: {
        title: `Changelog | ${siteConfig.name}`,
        description: `Track product updates, fixes, and improvements for ${siteConfig.name}.`,
        type: 'website',
        url: getAbsoluteUrl('/changelog'),
        images: [getAbsoluteUrl(siteConfig.ogImage)],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Changelog | ${siteConfig.name}`,
        description: `Track product updates, fixes, and improvements for ${siteConfig.name}.`,
        creator: siteConfig.twitterHandle,
        images: [getAbsoluteUrl(siteConfig.ogImage)],
    },
};

const entryTypeConfig: Record<
    ChangelogEntryType,
    {
        label: string;
        className: string;
        icon: typeof Rocket;
    }
> = {
    major: {
        label: 'Major',
        className: 'border-primary/30 bg-primary/10 text-primary',
        icon: Rocket,
    },
    feature: {
        label: 'Feature',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        icon: Sparkles,
    },
    improvement: {
        label: 'Improvement',
        className: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
        icon: Wrench,
    },
    fix: {
        label: 'Fix',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        icon: Bug,
    },
};

export default function ChangelogPage() {
    const entries = getChangelogEntries();
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Changelog | ${siteConfig.name}`,
        description: metadata.description,
        url: getAbsoluteUrl('/changelog'),
        mainEntity: entries.map((entry) => ({
            '@type': 'CreativeWork',
            name: `${entry.version}: ${entry.title}`,
            datePublished: entry.date,
            description: entry.summary,
        })),
    };

    return (
        <main className='min-h-screen bg-background'>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: toJsonLd(structuredData),
                }}
            />

            <section className='border-b border-border'>
                <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 py-14 md:py-18'>
                    <Link
                        href='/'
                        className='inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                    >
                        <ArrowLeft className='h-4 w-4' />
                        Back to articles
                    </Link>
                    <div className='max-w-3xl space-y-4'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-primary'>
                            Product updates
                        </p>
                        <h1 className='text-4xl font-semibold tracking-tight md:text-5xl'>
                            Changelog
                        </h1>
                        <p className='text-base leading-7 text-muted-foreground md:text-lg'>
                            A running log of improvements, shipped features, and fixes across{' '}
                            {siteConfig.name}.
                        </p>
                    </div>
                </div>
            </section>

            <section className='mx-auto max-w-5xl px-6 py-12'>
                <ol className='relative space-y-8 border-l border-border pl-6'>
                    {entries.map((entry) => {
                        const typeConfig = entryTypeConfig[entry.type];
                        const Icon = typeConfig.icon;

                        return (
                            <li key={`${entry.version}-${entry.date}`} className='relative'>
                                <span className='absolute -left-[35px] top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background'>
                                    <span className='h-2 w-2 rounded-full bg-primary' />
                                </span>
                                <article className='rounded-lg border border-border bg-card p-5 shadow-sm md:p-6'>
                                    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                                        <div className='space-y-2'>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium'>
                                                    <BadgeCheck className='h-3.5 w-3.5 text-primary' />
                                                    {entry.version}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
                                                        typeConfig.className,
                                                    )}
                                                >
                                                    <Icon className='h-3.5 w-3.5' />
                                                    {typeConfig.label}
                                                </span>
                                            </div>
                                            <h2 className='text-2xl font-semibold tracking-tight'>
                                                {entry.title}
                                            </h2>
                                        </div>
                                        <time
                                            dateTime={entry.date}
                                            className='text-sm text-muted-foreground'
                                        >
                                            {formatDate(entry.date)}
                                        </time>
                                    </div>

                                    <p className='mt-4 leading-7 text-muted-foreground'>
                                        {entry.summary}
                                    </p>

                                    <ul className='mt-5 space-y-3'>
                                        {entry.changes.map((change) => (
                                            <li
                                                key={change}
                                                className='flex gap-3 text-sm leading-6 text-muted-foreground'
                                            >
                                                <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                                                <span>{change}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </main>
    );
}
