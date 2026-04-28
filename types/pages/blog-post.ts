import type React from 'react';
import type { BlogData, BlogPage } from '@/types/blog';

export interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export interface BlogPostData extends BlogData {
    body: React.ComponentType;
}

export type BlogPostPage = BlogPage<BlogPostData>;
