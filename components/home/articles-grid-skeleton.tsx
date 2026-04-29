const SKELETON_CARD_COUNT = 6;

export function ArticlesGridSkeleton({ count = SKELETON_CARD_COUNT }: { count?: number }) {
    return (
        <div role='status' aria-live='polite' aria-busy='true'>
            <span className='sr-only'>Loading articles...</span>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6'>
                {Array.from({ length: count }, (_, index) => (
                    <article key={index} className='rounded-xl border border-border bg-background'>
                        <div className='aspect-[16/10] w-full animate-pulse bg-muted/50' />
                        <div className='p-6 space-y-3'>
                            <div className='flex gap-2'>
                                <div className='h-5 w-16 animate-pulse rounded-full bg-muted/60' />
                                <div className='h-5 w-20 animate-pulse rounded-full bg-muted/60' />
                            </div>
                            <div className='h-6 w-11/12 animate-pulse rounded-md bg-muted/60' />
                            <div className='h-6 w-7/12 animate-pulse rounded-md bg-muted/60' />
                            <div className='space-y-2 pt-1'>
                                <div className='h-4 w-full animate-pulse rounded-md bg-muted/50' />
                                <div className='h-4 w-10/12 animate-pulse rounded-md bg-muted/50' />
                            </div>
                            <div className='flex items-center justify-between pt-2'>
                                <div className='h-4 w-24 animate-pulse rounded-md bg-muted/50' />
                                <div className='h-4 w-16 animate-pulse rounded-md bg-muted/50' />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
