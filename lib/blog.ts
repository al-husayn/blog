import { blogSource } from '@/lib/blog-source';
import type { BlogData, BlogPage } from '@/types/blog';
import { parseDate } from '@/lib/utils';
import readTimeMap from '@/lib/generated/read-times.json';

export const BLOG_PATH_PREFIX = '/blog/';
const getComputedReadTime = (slug: string): string | undefined =>
    (readTimeMap as Record<string, string>)[slug];

const attachReadTime = <TData extends BlogData>(page: BlogPage<TData>): BlogPage<TData> => {
    const slug = getSlugFromPageUrl(page.url);
    const computedReadTime = slug ? getComputedReadTime(slug) : undefined;

    if (!computedReadTime) {
        return page;
    }

    try {
        Object.defineProperty(page.data, 'readTime', {
            value: computedReadTime,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        return page;
    } catch {
        const dataWithReadTime = Object.create(page.data);
        Object.defineProperty(dataWithReadTime, 'readTime', {
            value: computedReadTime,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        return { ...page, data: dataWithReadTime };
    }
};

export const getSlugFromPageUrl = (url: string): string | null => {
    if (!url.startsWith(BLOG_PATH_PREFIX)) {
        return null;
    }

    const slug = url.slice(BLOG_PATH_PREFIX.length).replace(/\/$/, '');
    if (!slug || slug.includes('/')) {
        return null;
    }

    return slug;
};

export const getBlogPage = <TData extends BlogData = BlogData>(
    slug: string,
): BlogPage<TData> | undefined => {
    const page = blogSource.getPage([slug]) as BlogPage<TData> | undefined;
    return page ? attachReadTime(page) : undefined;
};

export const getBlogPages = <TData extends BlogData = BlogData>(): Array<BlogPage<TData>> => {
    const pages = blogSource.getPages() as unknown as Array<BlogPage<TData>>;
    return pages.map(attachReadTime);
};

export const sortBlogPagesByDateDesc = <TData extends BlogData>(
    pages: Array<BlogPage<TData>>,
): Array<BlogPage<TData>> => {
    return [...pages].sort((a, b) => {
        const dateA = parseDate(a.data.date)?.getTime() ?? 0;
        const dateB = parseDate(b.data.date)?.getTime() ?? 0;
        return dateB - dateA;
    });
};

export const getBlogSlugs = (pages: Array<BlogPage> = getBlogPages()): string[] => {
    return pages
        .map((page) => getSlugFromPageUrl(page.url))
        .filter((slug): slug is string => Boolean(slug));
};
