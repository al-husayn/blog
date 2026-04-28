import { docs, meta } from '@/.source';
import { getAuthor, isValidAuthor } from '@/lib/authors';
import { siteConfig } from '@/lib/site';
import type { BlogPage } from '@/types/blog';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

const blogSource = loader({
    baseUrl: '/blog',
    source: createMDXSource(docs, meta),
});

const getTimestamp = (value: string): number => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const escapeXml = (value: string): string => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

const getAuthorName = (authorKey?: string): string => {
    if (authorKey && isValidAuthor(authorKey)) {
        return getAuthor(authorKey).name;
    }

    return 'Al-Hussein A.';
};

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
    const pages = blogSource.getPages() as BlogPage[];
    const sortedPages = [...pages].sort((a, b) => {
        return getTimestamp(b.data.date) - getTimestamp(a.data.date);
    });

    const latestTimestamp = sortedPages.length > 0 ? getTimestamp(sortedPages[0].data.date) : 0;
    const lastBuildDate = new Date(latestTimestamp || Date.now()).toUTCString();

    const itemsXml = sortedPages
        .map((page) => {
            const postUrl = `${siteConfig.url}${page.url}`;
            const title = escapeXml(page.data.title);
            const description = escapeXml(page.data.description);
            const pubDate = new Date(getTimestamp(page.data.date) || Date.now()).toUTCString();
            const author = escapeXml(getAuthorName(page.data.author));
            const categories = (page.data.tags ?? [])
                .map((tag) => `<category>${escapeXml(tag)}</category>`)
                .join('');

            return `
<item>
    <title>${title}</title>
    <link>${escapeXml(postUrl)}</link>
    <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
    <description>${description}</description>
    <pubDate>${pubDate}</pubDate>
    <dc:creator>${author}</dc:creator>
    ${categories}
</item>`.trim();
        })
        .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
</channel>
</rss>`;

    return new Response(rssXml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
