import type { ReactNode } from 'react';
import Link from 'next/link';
import { buildPageHref } from '@/lib/home-page';
import type { HomePageData, PaginationItem } from '@/types/pages/home';

function PaginationLink({
    href,
    disabled,
    children,
}: {
    href: string;
    disabled: boolean;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            aria-disabled={disabled}
            className={`inline-flex h-9 min-w-[84px] items-center justify-center rounded-md border px-3 text-center text-sm font-medium leading-none transition-colors md:min-w-[96px] ${
                disabled
                    ? 'pointer-events-none opacity-50 border-border'
                    : 'border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            }`}
        >
            {children}
        </Link>
    );
}

function PageNumberLink({
    item,
    currentPage,
    searchQuery,
    selectedTag,
}: {
    item: PaginationItem;
    currentPage: number;
    searchQuery?: string;
    selectedTag: string;
}) {
    if (item === 'ellipsis') {
        return <span className='text-sm text-muted-foreground px-1'>...</span>;
    }

    const isCurrentPage = item === currentPage;

    return (
        <Link
            href={buildPageHref({ page: item, searchQuery, selectedTag })}
            aria-current={isCurrentPage ? 'page' : undefined}
            className={`h-9 min-w-9 px-2 rounded-md border text-sm font-medium inline-flex items-center justify-center transition-colors ${
                isCurrentPage
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            }`}
        >
            {item}
        </Link>
    );
}

export function Pagination({
    currentPage,
    totalPages,
    paginationItems,
    searchQuery,
    selectedTag,
}: Pick<
    HomePageData,
    'currentPage' | 'totalPages' | 'paginationItems' | 'searchQuery' | 'selectedTag'
>) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav
            aria-label='Pagination'
            className='mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 md:flex-nowrap'
        >
            <PaginationLink
                href={buildPageHref({
                    page: Math.max(1, currentPage - 1),
                    searchQuery,
                    selectedTag,
                })}
                disabled={currentPage === 1}
            >
                Previous
            </PaginationLink>

            <div className='order-3 w-full justify-center flex items-center gap-2 md:order-none md:w-auto'>
                {paginationItems.map((item, index) => (
                    <PageNumberLink
                        key={item === 'ellipsis' ? `ellipsis-${index}` : item}
                        item={item}
                        currentPage={currentPage}
                        searchQuery={searchQuery}
                        selectedTag={selectedTag}
                    />
                ))}
            </div>

            <PaginationLink
                href={buildPageHref({
                    page: Math.min(totalPages, currentPage + 1),
                    searchQuery,
                    selectedTag,
                })}
                disabled={currentPage === totalPages}
            >
                Next
            </PaginationLink>
        </nav>
    );
}
