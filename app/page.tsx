import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { BlogCard } from '@/components/blog-card';
import { TagFilter } from '@/components/tag-filter';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { getAuthor, isValidAuthor } from '@/lib/authors';
import { blogSource } from '@/lib/blog-source';
import { getAbsoluteUrl, getIsoDate, toJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import { formatDate } from '@/lib/utils';

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
    q?: string;
}

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

const getSearchQuery = (query?: string): string | undefined => {
    if (!query) {
        return undefined;
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
        return undefined;
    }

    return normalizedQuery;
};

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<HomeSearchParams>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const selectedTag = getTagFilter(resolvedSearchParams.tag);
    const searchQuery = getSearchQuery(resolvedSearchParams.q);
    const hasTagFilter = Boolean(selectedTag);
    const hasSearchFilter = Boolean(searchQuery);
    const hasFilters = hasTagFilter || hasSearchFilter;

    const title = hasSearchFilter
        ? `Search Results for "${searchQuery}"`
        : hasTagFilter
          ? `${selectedTag} Articles`
          : 'Modern JavaScript, TypeScript, React, and Next.js Tutorials';
    const description = hasSearchFilter
        ? `Browse search results for "${searchQuery}" on ${siteConfig.name}.`
        : hasTagFilter
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
        robots: hasFilters
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

    const searchQuery = getSearchQuery(resolvedSearchParams.q);
    const selectedTag = resolvedSearchParams.tag || 'All';
    const blogsByTag =
        selectedTag === 'All'
            ? sortedBlogs
            : sortedBlogs.filter((blog) => blog.data.tags?.includes(selectedTag));
    const filteredBlogs =
        !searchQuery
            ? blogsByTag
            : blogsByTag.filter((blog) => {
                  const searchableContent = [
                      blog.data.title,
                      blog.data.description,
                      ...(blog.data.tags || []),
                      blog.data.author,
                      blog.data.readTime,
                  ]
                      .filter(Boolean)
                      .join(' ')
                      .toLowerCase();

                  return searchableContent.includes(searchQuery.toLowerCase());
              });

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
        <main role='main' className='min-h-screen bg-background relative'>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: toJsonLd(blogListJsonLd),
                }}
            />
            <div
                aria-hidden='true'
                className='absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]'>
                <FlickeringGrid
                    className='absolute top-0 left-0 size-full'
                    squareSize={4}
                    gridGap={6}
                    color='#6B7280'
                    maxOpacity={0.2}
                    flickerChance={0.05}
                />
            </div>
            <section
                aria-labelledby='home-hero-heading'
                className='p-6 border-b border-border flex flex-col gap-6 min-h-[250px] justify-center relative z-10'>
                <div className='max-w-7xl mx-auto w-full'>
                    <div className='flex flex-col gap-2'>
                        <h1 id='home-hero-heading' className='font-medium text-4xl md:text-5xl tracking-tighter'>
                            Learn. Build. Share.
                        </h1>
                        <p className='text-muted-foreground text-sm md:text-base lg:text-lg'>
                            A space for developers to grow their skills, build real projects, and share stories that
                            inspire others.
                        </p>
                    </div>
                </div>
                {allTags.length > 0 && (
                    <div className='max-w-7xl mx-auto w-full flex flex-col gap-3'>
                        <form action='/' method='get' className='flex w-full items-center gap-2'>
                            <label htmlFor='blog-search' className='sr-only'>
                                Search articles
                            </label>
                            <input
                                id='blog-search'
                                name='q'
                                type='search'
                                defaultValue={searchQuery || ''}
                                placeholder='Search articles...'
                                className='h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            />
                            {selectedTag !== 'All' && <input type='hidden' name='tag' value={selectedTag} />}
                            <button
                                type='submit'
                                className='h-10 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted transition-colors'>
                                Search
                            </button>
                            {searchQuery && (
                                <Link
                                    href={selectedTag === 'All' ? '/' : `/?tag=${encodeURIComponent(selectedTag)}`}
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    Clear
                                </Link>
                            )}
                        </form>
                        <TagFilter
                            tags={allTags}
                            selectedTag={selectedTag}
                            tagCounts={tagCounts}
                            panelId='filtered-articles-panel'
                        />
                    </div>
                )}
            </section>

            <section aria-labelledby='latest-articles-heading' className='max-w-7xl mx-auto w-full px-6 lg:px-0'>
                <h2 id='latest-articles-heading' className='sr-only'>
                    Latest articles
                </h2>
                <Suspense fallback={<div>Loading articles...</div>}>
                    <div
                        id='filtered-articles-panel'
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-x border-border ${
                            filteredBlogs.length < 4 ? 'border-b' : 'border-b-0'
                        }`}>
                        {filteredBlogs.length > 0 ? (
                            filteredBlogs.map((blog) => {
                                const date = new Date(blog.data.date);
                                const formattedDate = formatDate(date);
                                const authorKey = blog.data.author;
                                const authorRecord =
                                    authorKey && isValidAuthor(authorKey) ? getAuthor(authorKey) : undefined;
                                const authorName = authorRecord?.name;
                                const authorAvatar = blog.data.authorImage || authorRecord?.avatar;

                                return (
                                    <BlogCard
                                        key={blog.url}
                                        url={blog.url}
                                        title={blog.data.title}
                                        description={blog.data.description}
                                        date={formattedDate}
                                        authorName={authorName}
                                        authorAvatar={authorAvatar}
                                        readTime={blog.data.readTime}
                                        thumbnail={blog.data.thumbnail}
                                        showRightBorder={filteredBlogs.length < 3}
                                    />
                                );
                            })
                        ) : (
                            <div className='col-span-full p-6 text-sm text-muted-foreground'>
                                No articles found for
                                <span className='font-medium text-foreground'> {searchQuery}</span>
                            </div>
                        )}
                    </div>
                </Suspense>
            </section>
        </main>
    );
}
