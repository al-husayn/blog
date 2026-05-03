import type { BlogPage } from '@/types/blog';

export interface HomeSearchParams {
    tag?: string;
    q?: string;
    page?: string;
}

export interface HomePageRouteProps {
    searchParams: Promise<HomeSearchParams>;
}

export type PaginationItem = number | 'ellipsis';

export type AuthorMetadata = {
    authorName?: string;
    authorAvatar?: string;
};

export type TagMetadata = {
    allTags: string[];
    tagCounts: Record<string, number>;
};

export interface HomePageData extends TagMetadata {
    searchQuery?: string;
    selectedTag: string;
    paginatedBlogs: BlogPage[];
    featuredBlog?: BlogPage;
    showFeaturedPost: boolean;
    totalPages: number;
    currentPage: number;
    paginationItems: PaginationItem[];
    emptyStateLabel: string;
    resultsSummaryLabel: string;
    resultsContextLabel: string;
    visibleBlogs: BlogPage[];
}

export interface BuildPageHrefInput {
    page: number;
    searchQuery?: string;
    selectedTag: string;
}

export interface ArticlesGridProps {
    blogs: BlogPage[];
    emptyStateLabel: string;
}

export interface ArticlesGridSkeletonProps {
    count?: number;
}

export interface FeaturedPostProps {
    blog: BlogPage;
}

export interface PaginationLinkProps {
    href: string;
    disabled: boolean;
    children: React.ReactNode;
}

export interface PageNumberLinkProps {
    item: PaginationItem;
    currentPage: number;
    searchQuery?: string;
    selectedTag: string;
}

export interface SearchFormProps {
    searchQuery?: string;
    selectedTag: string;
}
