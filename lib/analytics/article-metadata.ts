import { getBlogPages, getSlugFromPageUrl } from '@/lib/blog';
import { parseDate } from '@/lib/utils';
import type { ArticleMetadata } from '@/lib/analytics/types';
import type { BlogData } from '@/types/blog';

export const getArticleMetadataMap = (): Map<string, ArticleMetadata> => {
    const metadataBySlug = new Map<string, ArticleMetadata>();

    for (const page of getBlogPages<BlogData>()) {
        const slug = getSlugFromPageUrl(page.url);

        if (!slug) {
            continue;
        }

        metadataBySlug.set(slug, {
            slug,
            title: page.data.title,
            description: page.data.description,
            publishedAt: page.data.date,
            publishedDate: parseDate(page.data.date),
        });
    }

    return metadataBySlug;
};
