'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
} from '@/components/ui/drawer';
import type { TagFilterProps } from '@/types/components/tag-filter';

const toTagId = (tag: string): string => {
    const normalized = tag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || 'all';
};

const getTabId = (tag: string, scope: 'desktop' | 'mobile'): string => {
    return `tag-tab-${scope}-${toTagId(tag)}`;
};

export function TagFilter({
    tags,
    selectedTag,
    tagCounts,
    panelId = 'filtered-articles-panel',
}: TagFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleTagClick = (tag: string) => {
        if (selectedTag === tag) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
        if (tag !== 'All') {
            params.set('tag', tag);
        } else {
            params.delete('tag');
        }

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    };

    const DesktopTagFilter = () => (
        <div
            className='hidden md:flex flex-wrap gap-2'
            role='tablist'
            aria-label='Filter articles by tag'
        >
            {tags.map((tag) => {
                const isSelected = selectedTag === tag;
                const tabId = getTabId(tag, 'desktop');

                return (
                    <button
                        type='button'
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        role='tab'
                        id={tabId}
                        aria-selected={isSelected}
                        aria-controls={panelId}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <span>{tag}</span>
                        {typeof tagCounts?.[tag] === 'number' && (
                            <span
                                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-[11px] font-semibold ${
                                    isSelected
                                        ? 'border-border/40 dark:border-primary-foreground bg-background text-primary'
                                        : 'border-border bg-card text-muted-foreground'
                                }`}
                            >
                                {tagCounts[tag]}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const MobileTagFilter = () => (
        <Drawer>
            <DrawerTrigger
                className='md:hidden w-full flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                aria-label='Open tag filters'
            >
                <span className='flex min-w-0 items-center gap-2'>
                    <span className='truncate text-sm font-medium'>{selectedTag}</span>
                    {typeof tagCounts?.[selectedTag] === 'number' ? (
                        <span className='inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-card px-1.5 text-[11px] font-semibold text-muted-foreground'>
                            {tagCounts[selectedTag]}
                        </span>
                    ) : null}
                </span>
                <ChevronDown className='h-4 w-4 text-muted-foreground' />
            </DrawerTrigger>

            <DrawerContent className='md:hidden max-h-[75vh]'>
                <DrawerHeader>
                    <h3 className='font-semibold text-sm'>Filter by topic</h3>
                </DrawerHeader>

                <DrawerBody>
                    <div className='space-y-2' role='tablist' aria-label='Filter articles by tag'>
                        {tags.map((tag) => {
                            const isSelected = selectedTag === tag;
                            const tabId = getTabId(tag, 'mobile');

                            return (
                                <button
                                    type='button'
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    role='tab'
                                    id={tabId}
                                    aria-selected={isSelected}
                                    aria-controls={panelId}
                                    data-drawer-close='true'
                                    className={`w-full rounded-md border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-foreground'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <span className='flex w-full items-center justify-between gap-2'>
                                        <span className='font-medium'>{tag}</span>
                                        <span className='flex items-center gap-2'>
                                            {typeof tagCounts?.[tag] === 'number' && (
                                                <span className='inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-card px-1.5 text-[11px] font-semibold text-muted-foreground'>
                                                    {tagCounts[tag]}
                                                </span>
                                            )}
                                            {isSelected ? (
                                                <Check
                                                    className='h-4 w-4 text-primary'
                                                    aria-hidden='true'
                                                />
                                            ) : null}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );

    return (
        <>
            <DesktopTagFilter />
            <MobileTagFilter />
        </>
    );
}
