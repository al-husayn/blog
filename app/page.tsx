import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogCard } from '@/components/blog-card';
import { TagFilter } from '@/components/tag-filter';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { getAuthor, isValidAuthor } from '@/lib/authors';
import { blogSource } from '@/lib/blog-source';
import { getAbsoluteUrl, getIsoDate, toJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import { formatDate, parseDate } from '@/lib/utils';

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
    page?: string;
}

const POSTS_PER_PAGE = 9;

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

const getPageNumber = (page?: string): number => {
    if (!page) {
        return 1;
    }

    const parsedPage = Number.parseInt(page, 10);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
        return 1;
    }

    return parsedPage;
};

const buildPaginationItems = (totalPages: number, currentPage: number): Array<number | 'ellipsis'> => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: Array<number | 'ellipsis'> = [1];

    if (currentPage > 3) {
        items.push('ellipsis');
    }

    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);

    for (let page = windowStart; page <= windowEnd; page += 1) {
        items.push(page);
    }

    if (currentPage < totalPages - 2) {
        items.push('ellipsis');
    }

    items.push(totalPages);

    return items;
};

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<HomeSearchParams>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const selectedTag = getTagFilter(resolvedSearchParams.tag);
    const searchQuery = getSearchQuery(resolvedSearchParams.q);
    const pageNumber = getPageNumber(resolvedSearchParams.page);
    const hasTagFilter = Boolean(selectedTag);
    const hasSearchFilter = Boolean(searchQuery);
    const hasPagination = pageNumber > 1;
    const hasFilters = hasTagFilter || hasSearchFilter || hasPagination;

    const baseTitle = hasSearchFilter
        ? `Search Results for "${searchQuery}"`
        : hasTagFilter
          ? `${selectedTag} Articles`
          : 'Modern JavaScript, TypeScript, React, and Next.js Tutorials';
    const title = hasPagination ? `${baseTitle} - Page ${pageNumber}` : baseTitle;
    const description = hasSearchFilter
        ? `Browse search results for "${searchQuery}" on ${siteConfig.name}.`
        : hasTagFilter
          ? `Browse ${selectedTag} articles and practical coding tutorials on ${siteConfig.name}.`
          : siteConfig.description;
    const canonicalParams = new URLSearchParams();
    if (selectedTag) {
        canonicalParams.set('tag', selectedTag);
    }
    if (searchQuery) {
        canonicalParams.set('q', searchQuery);
    }
    if (pageNumber > 1) {
        canonicalParams.set('page', String(pageNumber));
    }

    const canonicalPath = canonicalParams.toString() ? `/?${canonicalParams.toString()}` : '/';

    return {
        title,
        description,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: getAbsoluteUrl(canonicalPath),
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
        const dateA = parseDate(a.data.date)?.getTime() ?? 0;
        const dateB = parseDate(b.data.date)?.getTime() ?? 0;
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
    const requestedPage = getPageNumber(resolvedSearchParams.page);
    const featuredBlog = filteredBlogs.find((blog) => blog.data.featured) ?? filteredBlogs[0];
    const showFeaturedPost = Boolean(featuredBlog) && requestedPage === 1;
    const listBlogs =
        showFeaturedPost && featuredBlog ? filteredBlogs.filter((blog) => blog.url !== featuredBlog.url) : filteredBlogs;
    const totalPages = Math.max(1, Math.ceil(listBlogs.length / POSTS_PER_PAGE));
    const currentPage = Math.min(requestedPage, totalPages);
    const paginatedBlogs = listBlogs.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
    const paginationItems = buildPaginationItems(totalPages, currentPage);
    const newsletterCtaUrl = process.env.NEXT_PUBLIC_NEWSLETTER_URL;
    const emptyStateLabel = searchQuery ? `"${searchQuery}"` : selectedTag !== 'All' ? selectedTag : 'the selected filters';

    const resolveAuthorMetadata = (blog: BlogPage): { authorName?: string; authorAvatar?: string } => {
        const authorKey = blog.data.author;
        const authorRecord = authorKey && isValidAuthor(authorKey) ? getAuthor(authorKey) : undefined;

        return {
            authorName: authorRecord?.name,
            authorAvatar: blog.data.authorImage || authorRecord?.avatar,
        };
    };

    const buildPageHref = (page: number): string => {
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set('q', searchQuery);
        }
        if (selectedTag !== 'All') {
            params.set('tag', selectedTag);
        }
        if (page > 1) {
            params.set('page', String(page));
        }

        const queryString = params.toString();
        return queryString ? `/?${queryString}` : '/';
    };

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
    const visibleBlogs = [...(showFeaturedPost && featuredBlog ? [featuredBlog] : []), ...paginatedBlogs];

    const blogListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': getAbsoluteUrl('/#blog'),
        url: getAbsoluteUrl('/'),
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        blogPost: visibleBlogs.map((blog) => {
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

            {showFeaturedPost && featuredBlog && (
                <section aria-labelledby='featured-post-heading' className='max-w-7xl mx-auto w-full px-6 lg:px-0 py-8'>
                    <div className='space-y-4'>
                        <div>
                            <p className='text-xs uppercase tracking-wide text-primary font-semibold'>Featured</p>
                            <h2 id='featured-post-heading' className='text-2xl font-medium tracking-tight'>
                                Featured Post
                            </h2>
                        </div>
                        <Link
                            href={featuredBlog.url}
                            className='group block rounded-xl border border-border bg-card overflow-hidden transition-[background-color,box-shadow] duration-200 hover:bg-muted/20 hover:shadow-sm'>
                            <div className='grid gap-0 md:grid-cols-2'>
                                {featuredBlog.data.thumbnail && (
                                    <div className='relative min-h-[220px] md:min-h-[300px]'>
                                        <Image
                                            src={featuredBlog.data.thumbnail}
                                            alt={featuredBlog.data.title}
                                            fill
                                            className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                                            sizes='(max-width: 768px) 100vw, 50vw'
                                        />
                                    </div>
                                )}
                                <div className='p-6 flex flex-col gap-3 justify-center'>
                                    <span className='inline-flex w-fit items-center rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary'>
                                        FEATURED
                                    </span>
                                    <h3 className='text-2xl font-semibold tracking-tight group-hover:underline underline-offset-4'>
                                        {featuredBlog.data.title}
                                    </h3>
                                    <p className='text-muted-foreground text-sm md:text-base'>{featuredBlog.data.description}</p>
                                    <div className='text-xs text-muted-foreground flex flex-wrap items-center gap-2'>
                                        {(() => {
                                            const { authorName } = resolveAuthorMetadata(featuredBlog);
                                            return authorName ? <span className='font-medium'>{authorName}</span> : null;
                                        })()}
                                        {featuredBlog.data.readTime && <span>• {featuredBlog.data.readTime}</span>}
                                        <span>• {formatDate(featuredBlog.data.date)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            <section aria-labelledby='latest-articles-heading' className='max-w-7xl mx-auto w-full px-6 lg:px-0'>
                <h2 id='latest-articles-heading' className='sr-only'>
                    Latest articles
                </h2>
                <Suspense fallback={<div>Loading articles...</div>}>
                    <div
                        id='filtered-articles-panel'
                        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative overflow-hidden border-l border-t border-border'>
                        {paginatedBlogs.length > 0 ? (
                            paginatedBlogs.map((blog) => {
                                const formattedDate = formatDate(blog.data.date);
                                const { authorName, authorAvatar } = resolveAuthorMetadata(blog);

                                return (
                                    <BlogCard
                                        key={blog.url}
                                        url={blog.url}
                                        title={blog.data.title}
                                        description={blog.data.description}
                                        date={formattedDate}
                                        tags={blog.data.tags}
                                        authorName={authorName}
                                        authorAvatar={authorAvatar}
                                        readTime={blog.data.readTime}
                                        thumbnail={blog.data.thumbnail}
                                    />
                                );
                            })
                        ) : (
                            <div className='col-span-full border-r border-b border-border p-6 text-sm text-muted-foreground'>
                                No articles found for <span className='font-medium text-foreground'>{emptyStateLabel}</span>.
                            </div>
                        )}
                    </div>
                </Suspense>

                {totalPages > 1 && (
                    <nav aria-label='Pagination' className='mt-6 flex items-center justify-between gap-3'>
                        <Link
                            href={buildPageHref(Math.max(1, currentPage - 1))}
                            aria-disabled={currentPage === 1}
                            className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors ${
                                currentPage === 1
                                    ? 'pointer-events-none opacity-50 border-border'
                                    : 'border-border hover:bg-muted'
                            }`}>
                            Previous
                        </Link>

                        <div className='flex items-center gap-2'>
                            {paginationItems.map((item, index) =>
                                item === 'ellipsis' ? (
                                    <span key={`ellipsis-${index}`} className='text-sm text-muted-foreground px-1'>
                                        ...
                                    </span>
                                ) : (
                                    <Link
                                        key={item}
                                        href={buildPageHref(item)}
                                        aria-current={item === currentPage ? 'page' : undefined}
                                        className={`h-9 min-w-9 px-2 rounded-md border text-sm font-medium inline-flex items-center justify-center transition-colors ${
                                            item === currentPage
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border hover:bg-muted'
                                        }`}>
                                        {item}
                                    </Link>
                                ),
                            )}
                        </div>

                        <Link
                            href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                            aria-disabled={currentPage === totalPages}
                            className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors ${
                                currentPage === totalPages
                                    ? 'pointer-events-none opacity-50 border-border'
                                    : 'border-border hover:bg-muted'
                            }`}>
                            Next
                        </Link>
                    </nav>
                )}
            </section>

            {newsletterCtaUrl && (
                <section className='max-w-7xl mx-auto w-full px-6 lg:px-0 py-10'>
                    <div className='rounded-xl border border-border bg-card p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                        <div className='space-y-1'>
                            <h2 className='text-xl font-medium tracking-tight'>Get new posts in your inbox</h2>
                            <p className='text-sm text-muted-foreground'>
                                Optional newsletter for JavaScript, React, and Next.js deep dives.
                            </p>
                        </div>
                        <a
                            href={newsletterCtaUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted transition-colors'>
                            Subscribe
                        </a>
                    </div>
                </section>
            )}
        </main>
    );
}
