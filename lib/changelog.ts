import type { ChangelogEntry } from '@/types/changelog';
import { parseDate } from '@/lib/utils';

export const changelogEntries: ChangelogEntry[] = [
    {
        version: '0.1.0',
        date: '2026-05-10',
        title: 'Public Blog Foundation',
        type: 'major',
        summary:
            'The first public version of Learn. Build. Share with MDX articles, engagement, analytics, and production-ready SEO.',
        changes: [
            'Launched the Next.js App Router blog with Fumadocs MDX content and generated reading times.',
            'Added article pages with Open Graph images, RSS, sitemap, and structured metadata.',
            'Introduced Clerk-backed article upvotes, comments, and comment upvotes.',
            'Added the private admin analytics dashboard for pageviews, traffic sources, shares, engagement, and audience metrics.',
            'Shipped the embedded article assistant powered by an OpenAI-compatible API endpoint.',
        ],
    },
];

export function getChangelogEntries(): ChangelogEntry[] {
    return [...changelogEntries].sort((entryA, entryB) => {
        const dateA = parseDate(entryA.date)?.getTime() ?? 0;
        const dateB = parseDate(entryB.date)?.getTime() ?? 0;

        return dateB - dateA;
    });
}
