import fs from 'node:fs';
import path from 'node:path';
import { blogSource } from '@/lib/blog-source';
import type { BlogData, BlogPage } from '@/types/blog';
import { parseDate } from '@/lib/utils';

export const BLOG_PATH_PREFIX = '/blog/';
const WORDS_PER_MINUTE = 200;
const BLOG_CONTENT_DIR = path.join(process.cwd(), 'blog', 'content');
const FRONTMATTER_REGEX = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

const stripFrontmatter = (content: string): string => content.replace(FRONTMATTER_REGEX, '');

const calculateReadTime = (slug: string): string | undefined => {
    try {
        const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);
        if (!fs.existsSync(filePath)) {
            return undefined;
        }

        const rawContent = fs.readFileSync(filePath, 'utf8');
        const content = stripFrontmatter(rawContent);
        const words = content.match(/\b[\w'-]+\b/g);
        const wordCount = words?.length ?? 0;

        if (!wordCount) {
            return undefined;
        }

        const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
        return `${minutes} min read`;
    } catch {
        return undefined;
    }
};

const attachReadTime = <TData extends BlogData>(page: BlogPage<TData>): BlogPage<TData> => {
    const slug = getSlugFromPageUrl(page.url);
    const computedReadTime = slug ? calculateReadTime(slug) : undefined;

    if (!computedReadTime) {
        return page;
    }

    return {
        ...page,
        data: {
            ...page.data,
            readTime: computedReadTime,
        },
    };
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

export const getBlogPage = <TData extends BlogData = BlogData>(slug: string): BlogPage<TData> | undefined => {
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
