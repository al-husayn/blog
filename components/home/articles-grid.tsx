import { BlogCard } from '@/components/blog-card';
import { ARTICLES_PANEL_ID, resolveAuthorMetadata } from '@/lib/home-page';
import { formatDate } from '@/lib/utils';
import type { BlogPage } from '@/types/blog';

export function ArticlesGrid({
    blogs,
    emptyStateLabel,
}: {
    blogs: BlogPage[];
    emptyStateLabel: string;
}) {
    return (
        <div
            id={ARTICLES_PANEL_ID}
            className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6'
        >
            {blogs.length > 0 ? (
                blogs.map((blog) => {
                    const { authorName, authorAvatar } = resolveAuthorMetadata(blog);

                    return (
                        <BlogCard
                            key={blog.url}
                            url={blog.url}
                            title={blog.data.title}
                            description={blog.data.description}
                            date={formatDate(blog.data.date)}
                            tags={blog.data.tags}
                            authorName={authorName}
                            authorAvatar={authorAvatar}
                            readTime={blog.data.readTime}
                            thumbnail={blog.data.thumbnail}
                        />
                    );
                })
            ) : (
                <div className='col-span-full rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground'>
                    No articles found for{' '}
                    <span className='font-medium text-foreground'>{emptyStateLabel}</span>.
                </div>
            )}
        </div>
    );
}
