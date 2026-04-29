import Image from 'next/image';
import Link from 'next/link';
import { resolveAuthorMetadata } from '@/lib/home-page';
import { formatDate } from '@/lib/utils';
import type { BlogPage } from '@/types/blog';

export function FeaturedPost({ blog }: { blog: BlogPage }) {
    const { authorName } = resolveAuthorMetadata(blog);

    return (
        <section
            aria-labelledby='featured-post-heading'
            className='max-w-7xl mx-auto w-full px-6 lg:px-0 py-8'
        >
            <div className='space-y-4'>
                <div>
                    <p className='text-xs uppercase tracking-wide text-primary font-semibold'>
                        Featured
                    </p>
                    <h2 id='featured-post-heading' className='text-2xl font-medium tracking-tight'>
                        Featured Post
                    </h2>
                </div>
                <Link
                    href={blog.url}
                    className='group block rounded-xl border border-border bg-card overflow-hidden transition-[background-color,box-shadow] duration-200 hover:bg-muted/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                >
                    <div className='grid gap-0 md:grid-cols-2'>
                        {blog.data.thumbnail && (
                            <div className='relative min-h-[220px] md:min-h-[300px]'>
                                <Image
                                    src={blog.data.thumbnail}
                                    alt={blog.data.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className='object-cover transition-transform duration-300 group-hover:scale-[1.02] dark:brightness-[0.86] dark:contrast-110 dark:saturate-90'
                                    sizes='(max-width: 768px) 100vw, 50vw'
                                />
                                <div
                                    aria-hidden='true'
                                    className='pointer-events-none absolute inset-0 bg-black/0 dark:bg-black/20 transition-colors duration-300 group-hover:dark:bg-black/10'
                                />
                            </div>
                        )}
                        <div className='p-6 flex flex-col gap-3 justify-center'>
                            <span className='inline-flex w-fit items-center rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary'>
                                FEATURED
                            </span>
                            <h3 className='text-2xl font-semibold tracking-tight group-hover:underline underline-offset-4'>
                                {blog.data.title}
                            </h3>
                            <p className='text-muted-foreground text-sm md:text-base'>
                                {blog.data.description}
                            </p>
                            <div className='text-xs text-muted-foreground flex flex-wrap items-center gap-2'>
                                {authorName && <span className='font-medium'>{authorName}</span>}
                                {blog.data.readTime && <span>• {blog.data.readTime}</span>}
                                <span>• {formatDate(blog.data.date)}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
