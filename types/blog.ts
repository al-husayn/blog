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
