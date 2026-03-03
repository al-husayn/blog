import { blogSource } from '@/lib/blog-source';
import { parseDate } from '@/lib/utils';

export interface BlogData {
    title: string;
    description: string;
    date: string;
    tags?: string[];
    featured?: boolean;
    readTime?: string;
    author?: string;
    authorImage?: string;
    thumbnail?: string;
    'article:section'?: string;
    'article:tag'?: string;
}

export interface BlogPage<TData extends BlogData = BlogData> {
    url: string;
    data: TData;
}

export const BLOG_PATH_PREFIX = '/blog/';

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

export const getBlogPages = <TData extends BlogData = BlogData>(): Array<BlogPage<TData>> => {
    return blogSource.getPages() as unknown as Array<BlogPage<TData>>;
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
