import { getAuthor, isValidAuthor } from '@/lib/authors';
import { getBlogPages, sortBlogPagesByDateDesc } from '@/lib/blog';
import { getAbsoluteUrl, getIsoDate } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import type { BlogPage } from '@/types/blog';
import type {
    AuthorMetadata,
    BuildPageHrefInput,
    HomePageData,
    HomeSearchParams,
    PaginationItem,
    TagMetadata,
} from '@/types/pages/home';

const POSTS_PER_PAGE = 9;

export const ALL_TAG = 'All';
export const ARTICLES_PANEL_ID = 'filtered-articles-panel';

const normalizeOptionalParam = (value?: string): string | undefined => {
    const normalizedValue = value?.trim();
    return normalizedValue || undefined;
};

const getTagFilter = (tag?: string): string | undefined => {
    const normalizedTag = normalizeOptionalParam(tag);
    return normalizedTag?.toLowerCase() === 'all' ? undefined : normalizedTag;
};

const getSearchQuery = (query?: string): string | undefined => normalizeOptionalParam(query);

const getPageNumber = (page?: string): number => {
    const parsedPage = Number.parseInt(page ?? '', 10);
    return Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
};

const getResultsLabel = (count: number): string =>
    `${count} ${count === 1 ? 'article' : 'articles'}`;

const buildPaginationItems = (totalPages: number, currentPage: number): PaginationItem[] => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const middlePages = Array.from({ length: 3 }, (_, index) => currentPage - 1 + index).filter(
        (page) => page > 1 && page < totalPages,
    );

    return [
        1,
        ...(currentPage > 3 ? (['ellipsis'] as const) : []),
        ...middlePages,
        ...(currentPage < totalPages - 2 ? (['ellipsis'] as const) : []),
        totalPages,
    ];
};

const collectTagMetadata = (blogs: BlogPage[]): TagMetadata => {
    const tagCounts = blogs.reduce<Record<string, number>>(
        (counts, blog) => {
            blog.data.tags?.forEach((tag) => {
                counts[tag] = (counts[tag] ?? 0) + 1;
            });

            return counts;
        },
        { [ALL_TAG]: blogs.length },
    );

    const allTags = [
        ALL_TAG,
        ...Object.keys(tagCounts)
            .filter((tag) => tag !== ALL_TAG)
            .sort((a, b) => a.localeCompare(b)),
    ];

    return { allTags, tagCounts };
};

const matchesSearchQuery = (blog: BlogPage, normalizedQuery: string): boolean => {
    const searchableContent = [
        blog.data.title,
        blog.data.description,
        ...(blog.data.tags ?? []),
        blog.data.author,
        blog.data.readTime,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return searchableContent.includes(normalizedQuery);
};

export const resolveAuthorMetadata = (blog: BlogPage): AuthorMetadata => {
    const authorKey = blog.data.author;
    const authorRecord = authorKey && isValidAuthor(authorKey) ? getAuthor(authorKey) : undefined;

    return {
        authorName: authorRecord?.name,
        authorAvatar: blog.data.authorImage || authorRecord?.avatar,
    };
};

const filterBlogs = (blogs: BlogPage[], selectedTag: string, searchQuery?: string): BlogPage[] => {
    const blogsByTag =
        selectedTag === ALL_TAG
            ? blogs
            : blogs.filter((blog) => blog.data.tags?.includes(selectedTag));
    const normalizedSearchQuery = searchQuery?.toLowerCase();

    return normalizedSearchQuery
        ? blogsByTag.filter((blog) => matchesSearchQuery(blog, normalizedSearchQuery))
        : blogsByTag;
};

const paginateBlogs = (
    blogs: BlogPage[],
    requestedPage: number,
): { totalPages: number; currentPage: number; paginatedBlogs: BlogPage[] } => {
    const totalPages = Math.max(1, Math.ceil(blogs.length / POSTS_PER_PAGE));
    const currentPage = Math.min(requestedPage, totalPages);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;

    return {
        totalPages,
        currentPage,
        paginatedBlogs: blogs.slice(startIndex, startIndex + POSTS_PER_PAGE),
    };
};

const getFeaturedBlog = (blogs: BlogPage[], requestedPage: number): BlogPage | undefined => {
    return requestedPage === 1 ? (blogs.find((blog) => blog.data.featured) ?? blogs[0]) : undefined;
};

const getEmptyStateLabel = (searchQuery: string | undefined, selectedTag: string): string => {
    if (searchQuery) {
        return `"${searchQuery}"`;
    }

    return selectedTag !== ALL_TAG ? selectedTag : 'the selected filters';
};

const getResultsContextLabel = (searchQuery: string | undefined, selectedTag: string): string => {
    if (searchQuery) {
        return `Filtered by "${searchQuery}"`;
    }

    return selectedTag !== ALL_TAG ? `Filtered by ${selectedTag}` : 'Latest posts';
};

export const getHomePageData = (searchParams: HomeSearchParams): HomePageData => {
    const sortedBlogs = sortBlogPagesByDateDesc(getBlogPages());
    const tagMetadata = collectTagMetadata(sortedBlogs);
    const searchQuery = getSearchQuery(searchParams.q);
    const selectedTag = getTagFilter(searchParams.tag) ?? ALL_TAG;
    const requestedPage = getPageNumber(searchParams.page);
    const filteredBlogs = filterBlogs(sortedBlogs, selectedTag, searchQuery);
    const featuredBlog = getFeaturedBlog(filteredBlogs, requestedPage);
    const listBlogs = featuredBlog
        ? filteredBlogs.filter((blog) => blog.url !== featuredBlog.url)
        : filteredBlogs;
    const { totalPages, currentPage, paginatedBlogs } = paginateBlogs(listBlogs, requestedPage);

    return {
        ...tagMetadata,
        searchQuery,
        selectedTag,
        featuredBlog,
        showFeaturedPost: Boolean(featuredBlog),
        totalPages,
        currentPage,
        paginatedBlogs,
        paginationItems: buildPaginationItems(totalPages, currentPage),
        emptyStateLabel: getEmptyStateLabel(searchQuery, selectedTag),
        resultsSummaryLabel: `${getResultsLabel(filteredBlogs.length)} found`,
        resultsContextLabel: getResultsContextLabel(searchQuery, selectedTag),
        visibleBlogs: [...(featuredBlog ? [featuredBlog] : []), ...paginatedBlogs],
    };
};

export const buildPageHref = ({
    page,
    searchQuery,
    selectedTag,
}: BuildPageHrefInput): string => {
    const params = new URLSearchParams();
    if (searchQuery) {
        params.set('q', searchQuery);
    }
    if (selectedTag !== ALL_TAG) {
        params.set('tag', selectedTag);
    }
    if (page > 1) {
        params.set('page', String(page));
    }

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
};

const getCanonicalPath = ({ tag, q, page }: HomeSearchParams): string => {
    return buildPageHref({
        page: getPageNumber(page),
        searchQuery: getSearchQuery(q),
        selectedTag: getTagFilter(tag) ?? ALL_TAG,
    });
};

export const getMetadataContent = (searchParams: HomeSearchParams) => {
    const selectedTag = getTagFilter(searchParams.tag);
    const searchQuery = getSearchQuery(searchParams.q);
    const pageNumber = getPageNumber(searchParams.page);
    const hasPagination = pageNumber > 1;
    const baseTitle = searchQuery
        ? `Search Results for "${searchQuery}"`
        : selectedTag
          ? `${selectedTag} Articles`
          : 'Modern JavaScript, TypeScript, React, and Next.js Tutorials';
    const description = searchQuery
        ? `Browse search results for "${searchQuery}" on ${siteConfig.name}.`
        : selectedTag
          ? `Browse ${selectedTag} articles and practical coding tutorials on ${siteConfig.name}.`
          : siteConfig.description;

    return {
        title: hasPagination ? `${baseTitle} - Page ${pageNumber}` : baseTitle,
        description,
        canonicalPath: getCanonicalPath(searchParams),
        shouldHideFromIndex: Boolean(selectedTag || searchQuery || hasPagination),
    };
};

export const buildBlogListJsonLd = (visibleBlogs: BlogPage[]) => ({
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
            image: getAbsoluteUrl(blog.data.thumbnail || siteConfig.ogImage),
            ...(publishedTime ? { datePublished: publishedTime } : {}),
        };
    }),
});
