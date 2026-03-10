import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';
import { getAuthor, isValidAuthor } from '@/lib/authors';
import { getAbsoluteUrl, getIsoDate } from '@/lib/seo';
import { metadataKeywords } from '@/app/metadata';
import type { BlogPage } from '@/types/blog';
import { getBlogPage } from '@/lib/blog';

const getAuthorName = (authorKey?: string): string => {
    if (authorKey && isValidAuthor(authorKey)) {
        return getAuthor(authorKey).name;
    }

    return siteConfig.creator;
};

const getArticleTagKeywords = (rawTags: string | undefined): string[] => {
    if (!rawTags) {
        return [];
    }

    return rawTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    try {
        const { slug } = await params;
        if (!slug) {
            return {
                title: 'Blog Not Found',
                description: 'The requested blog post could not be found.',
                robots: {
                    index: false,
                    follow: false,
                },
            };
        }

        const page = getBlogPage(slug) as BlogPage | undefined;
        if (!page) {
            return {
                title: 'Blog Not Found',
                description: 'The requested blog post could not be found.',
                robots: {
                    index: false,
                    follow: false,
                },
            };
        }

        const canonicalUrl = getAbsoluteUrl(`/blog/${slug}`);
        const defaultOgImage = getAbsoluteUrl(`/blog/${slug}/opengraph-image`);
        const ogImageUrl = page.data.thumbnail ? getAbsoluteUrl(page.data.thumbnail) : defaultOgImage;
        const authorName = getAuthorName(page.data.author);
        const publishedTime = getIsoDate(page.data.date);
        const section = page.data['article:section'] || page.data.tags?.[0];
        const articleTagKeywords = getArticleTagKeywords(page.data['article:tag']);

        const keywords = Array.from(
            new Set([
                ...metadataKeywords,
                page.data.title,
                ...(page.data.tags || []),
                ...articleTagKeywords,
                'blog post',
                'developer guide',
            ]),
        );

        return {
            title: page.data.title,
            description: page.data.description,
            keywords,
            authors: [
                {
                    name: authorName,
                    url: siteConfig.creatorUrl,
                },
            ],
            creator: authorName,
            publisher: siteConfig.creator,
            alternates: {
                canonical: canonicalUrl,
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
            openGraph: {
                title: page.data.title,
                description: page.data.description,
                type: 'article',
                locale: siteConfig.locale,
                url: canonicalUrl,
                siteName: siteConfig.name,
                authors: [authorName],
                tags: page.data.tags,
                section,
                publishedTime,
                modifiedTime: publishedTime,
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: page.data.title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: page.data.title,
                description: page.data.description,
                images: [ogImageUrl],
                creator: siteConfig.twitterHandle,
                site: siteConfig.twitterHandle,
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Blog Not Found',
            description: 'The requested blog post could not be found.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}
