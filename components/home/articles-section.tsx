import { Suspense } from 'react';
import { ArticlesGrid } from '@/components/home/articles-grid';
import { ArticlesGridSkeleton } from '@/components/home/articles-grid-skeleton';
import { Pagination } from '@/components/home/pagination';
import type { HomePageData } from '@/types/pages/home';

export function ArticlesSection({
    paginatedBlogs,
    emptyStateLabel,
    resultsSummaryLabel,
    resultsContextLabel,
    currentPage,
    totalPages,
    paginationItems,
    searchQuery,
    selectedTag,
}: Pick<
    HomePageData,
    | 'paginatedBlogs'
    | 'emptyStateLabel'
    | 'resultsSummaryLabel'
    | 'resultsContextLabel'
    | 'currentPage'
    | 'totalPages'
    | 'paginationItems'
    | 'searchQuery'
    | 'selectedTag'
>) {
    return (
        <section
            aria-labelledby='latest-articles-heading'
            className='max-w-7xl mx-auto w-full px-6 lg:px-0'
        >
            <div className='mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3'>
                <h2
                    id='latest-articles-heading'
                    className='text-sm font-semibold tracking-wide text-foreground/90 md:text-base'
                >
                    {resultsSummaryLabel}
                </h2>
                <p className='text-xs text-muted-foreground md:text-sm'>
                    {resultsContextLabel}
                    {totalPages > 1 ? ` • Page ${currentPage} of ${totalPages}` : ''}
                </p>
            </div>

            <Suspense fallback={<ArticlesGridSkeleton />}>
                <ArticlesGrid blogs={paginatedBlogs} emptyStateLabel={emptyStateLabel} />
            </Suspense>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginationItems={paginationItems}
                searchQuery={searchQuery}
                selectedTag={selectedTag}
            />
        </section>
    );
}
