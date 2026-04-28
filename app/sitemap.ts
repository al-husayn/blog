import type { MetadataRoute } from 'next';
import { docs, meta } from '@/.source';
import type { BlogPage } from '@/types/blog';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { getAbsoluteUrl } from '@/lib/seo';

const blogSource = loader({
    baseUrl: '/blog',
    source: createMDXSource(docs, meta),
});

const parseLastModified = (value: string): Date => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return new Date();
    }

    return date;
};

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = blogSource.getPages() as BlogPage[];
    const latestPostDate =
        posts.length > 0
            ? parseLastModified(
                  posts
                      .map((post) => post.data.date)
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
              )
            : new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: getAbsoluteUrl('/'),
            lastModified: latestPostDate,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: getAbsoluteUrl('/about'),
            lastModified: latestPostDate,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: getAbsoluteUrl('/privacy'),
            lastModified: new Date('2026-04-22T00:00:00.000Z'),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: getAbsoluteUrl('/rss.xml'),
            lastModified: latestPostDate,
            changeFrequency: 'weekly',
            priority: 0.3,
        },
    ];

    const postRoutes: MetadataRoute.Sitemap = posts
        .sort(
            (a, b) =>
                parseLastModified(b.data.date).getTime() - parseLastModified(a.data.date).getTime(),
        )
        .map((post) => ({
            url: getAbsoluteUrl(post.url),
            lastModified: parseLastModified(post.data.date),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    return [...staticRoutes, ...postRoutes];
}
