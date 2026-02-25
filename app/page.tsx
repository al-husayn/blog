import type { Metadata } from 'next';
import { docs, meta } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { Suspense } from 'react';
import { BlogCard } from '@/components/blog-card';
import { TagFilter } from '@/components/tag-filter';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { getAbsoluteUrl, getIsoDate, toJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

interface BlogData {
    title: string;
    description: string;
    date: string;
    tags?: string[];
    featured?: boolean;
    readTime?: string;
    author?: string;
    authorImage?: string;
    thumbnail?: string;
}

interface BlogPage {
    url: string;
    data: BlogData;
}

interface HomeSearchParams {
    tag?: string;
}

const blogSource = loader({
    baseUrl: '/blog',
    source: createMDXSource(docs, meta),
});

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getTagFilter = (tag?: string): string | undefined => {
    if (!tag) {
        return undefined;
    }

    const normalizedTag = tag.trim();
    if (!normalizedTag || normalizedTag.toLowerCase() === 'all') {
        return undefined;
    }

    return normalizedTag;
};

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<HomeSearchParams>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const selectedTag = getTagFilter(resolvedSearchParams.tag);
    const hasTagFilter = Boolean(selectedTag);

    const title = hasTagFilter
        ? `${selectedTag} Articles`
        : 'Modern JavaScript, TypeScript, React, and Next.js Tutorials';
    const description = hasTagFilter
        ? `Browse ${selectedTag} articles and practical coding tutorials on ${siteConfig.name}.`
        : siteConfig.description;

    return {
        title,
        description,
        alternates: {
            canonical: '/',
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: getAbsoluteUrl('/'),
            images: [getAbsoluteUrl(siteConfig.ogImage)],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: siteConfig.twitterHandle,
            images: [getAbsoluteUrl(siteConfig.ogImage)],
        },
        robots: hasTagFilter
            ? {
                  index: false,
                  follow: true,
              }
            : undefined,
    };
}

export const revalidate = 3600;

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<HomeSearchParams>;
}) {
    const resolvedSearchParams = await searchParams;
    const allPages = blogSource.getPages() as BlogPage[];
    const sortedBlogs = [...allPages].sort((a, b) => {
        const dateA = new Date(a.data.date).getTime();
        const dateB = new Date(b.data.date).getTime();
        return dateB - dateA;
    });

    const allTags = ['All', ...Array.from(new Set(sortedBlogs.flatMap((blog) => blog.data.tags || []))).sort()];

    const selectedTag = resolvedSearchParams.tag || 'All';
    const filteredBlogs =
        selectedTag === 'All'
            ? sortedBlogs
            : sortedBlogs.filter((blog) => blog.data.tags?.includes(selectedTag));

    const tagCounts = allTags.reduce(
        (acc, tag) => {
            if (tag === 'All') {
                acc[tag] = sortedBlogs.length;
            } else {
                acc[tag] = sortedBlogs.filter((blog) => blog.data.tags?.includes(tag)).length;
            }
            return acc;
        },
        {} as Record<string, number>,
    );

    const blogListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': getAbsoluteUrl('/#blog'),
        url: getAbsoluteUrl('/'),
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        blogPost: filteredBlogs.map((blog) => {
            const publishedTime = getIsoDate(blog.data.date);

            return {
                '@type': 'BlogPosting',
                headline: blog.data.title,
                description: blog.data.description,
                url: getAbsoluteUrl(blog.url),
                image: blog.data.thumbnail
                    ? getAbsoluteUrl(blog.data.thumbnail)
                    : getAbsoluteUrl(siteConfig.ogImage),
                ...(publishedTime ? { datePublished: publishedTime } : {}),
            };
        }),
    };

    return (
        <main className='min-h-screen bg-background relative'>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: toJsonLd(blogListJsonLd),
                }}
            />
            <div className='absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]'>
                <FlickeringGrid
                    className='absolute top-0 left-0 size-full'
                    squareSize={4}
                    gridGap={6}
                    color='#6B7280'
                    maxOpacity={0.2}
                    flickerChance={0.05}
                />
            </div>
            <div className='p-6 border-b border-border flex flex-col gap-6 min-h-[250px] justify-center relative z-10'>
                <div className='max-w-7xl mx-auto w-full'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='font-medium text-4xl md:text-5xl tracking-tighter'>Learn. Build. Share.</h1>
                        <p className='text-muted-foreground text-sm md:text-base lg:text-lg'>
                            A space for developers to grow their skills, build real projects, and share stories that
                            inspire others.
                        </p>
                    </div>
                </div>
                {allTags.length > 0 && (
                    <div className='max-w-7xl mx-auto w-full'>
                        <TagFilter tags={allTags} selectedTag={selectedTag} tagCounts={tagCounts} />
                    </div>
                )}
            </div>

            <div className='max-w-7xl mx-auto w-full px-6 lg:px-0'>
                <Suspense fallback={<div>Loading articles...</div>}>
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-x border-border ${
                            filteredBlogs.length < 4 ? 'border-b' : 'border-b-0'
                        }`}>
                        {filteredBlogs.map((blog) => {
                            const date = new Date(blog.data.date);
                            const formattedDate = formatDate(date);

                            return (
                                <BlogCard
                                    key={blog.url}
                                    url={blog.url}
                                    title={blog.data.title}
                                    description={blog.data.description}
                                    date={formattedDate}
                                    thumbnail={blog.data.thumbnail}
                                    showRightBorder={filteredBlogs.length < 3}
                                />
                            );
                        })}
                    </div>
                </Suspense>
            </div>
        </main>
    );
}
