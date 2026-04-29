import Link from 'next/link';
import { ALL_TAG } from '@/lib/home-page';

export function SearchForm({
    searchQuery,
    selectedTag,
}: {
    searchQuery?: string;
    selectedTag: string;
}) {
    return (
        <form action='/' method='get' className='flex w-full items-center gap-2'>
            <label htmlFor='blog-search' className='sr-only'>
                Search articles
            </label>
            <input
                id='blog-search'
                name='q'
                type='search'
                defaultValue={searchQuery || ''}
                placeholder='Search articles...'
                className='h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            />
            {selectedTag !== ALL_TAG && <input type='hidden' name='tag' value={selectedTag} />}
            <button
                type='submit'
                className='h-10 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            >
                Search
            </button>
            {searchQuery && (
                <Link
                    href={
                        selectedTag === ALL_TAG ? '/' : `/?tag=${encodeURIComponent(selectedTag)}`
                    }
                    className='rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                >
                    Clear
                </Link>
            )}
        </form>
    );
}
