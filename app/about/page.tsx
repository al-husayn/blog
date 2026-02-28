import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { HashScrollHandler } from '@/components/hash-scroll-handler';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Code2, Globe, Layers, Rss, Send } from 'lucide-react';
import { siteConfig } from '@/lib/site';
import { getAbsoluteUrl } from '@/lib/seo';
import { blogSource } from '@/lib/blog-source';
import { formatDate, parseDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn more about Al-Hussein and the mission behind Learn. Build. Share.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description:
      'Learn more about Al-Hussein A. and the mission behind Learn. Build. Share.',
    type: 'profile',
    url: getAbsoluteUrl('/about'),
    images: [getAbsoluteUrl('/authors/AL.png')],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About | ${siteConfig.name}`,
    description:
      'Learn more about Al-Hussein and the mission behind Learn. Build. Share.',
    creator: siteConfig.twitterHandle,
    images: [getAbsoluteUrl('/authors/AL.png')],
  },
};

interface BlogData {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  readTime?: string;
}

interface BlogPage {
  url: string;
  data: BlogData;
}

interface ConnectLink {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  external?: boolean;
}

const connectLinks: ConnectLink[] = [
  {
    label: 'Portfolio',
    href: siteConfig.creatorUrl,
    description: 'Projects, case studies, and ways to connect.',
    icon: Globe,
    external: true,
  },
  {
    label: 'Follow on X',
    href: `https://x.com/${siteConfig.twitterHandle.replace('@', '')}`,
    description: 'Quick tips, updates, and new post drops.',
    icon: Send,
    external: true,
  },
  {
    label: 'RSS Feed',
    href: '/rss.xml',
    description: 'Subscribe in your reader and never miss a post.',
    icon: Rss,
  },
];

const focusAreas = [
  'JavaScript fundamentals',
  'TypeScript patterns',
  'React and Next.js architecture',
  'Web performance and accessibility',
  'Debugging and developer tooling',
  'Blockchain and web3 fundamentals',
];

export default function AboutPage() {
  const allPages = blogSource.getPages() as BlogPage[];
  const recentPosts = [...allPages]
    .sort((a, b) => {
      const dateA = parseDate(a.data.date)?.getTime() ?? 0;
      const dateB = parseDate(b.data.date)?.getTime() ?? 0;
      return dateB - dateA;
    })
    .slice(0, 3);
  const topicCount = new Set(allPages.flatMap((page) => page.data.tags ?? [])).size;

  return (
    <main className='min-h-screen bg-background relative'>
      <HashScrollHandler />

      <section
        aria-labelledby='about-hero-heading'
        className='border-b border-border relative overflow-hidden'>
        <div
          aria-hidden='true'
          className='absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)] pointer-events-none'>
          <FlickeringGrid
            className='absolute top-0 left-0 size-full'
            squareSize={4}
            gridGap={6}
            color='#6B7280'
            maxOpacity={0.2}
            flickerChance={0.05}
          />
        </div>
        <div className='max-w-7xl mx-auto p-6 min-h-[250px] flex items-center relative z-10'>
          <div className='flex flex-col md:flex-row items-center gap-8'>
            <div className='relative h-32 w-32 overflow-hidden rounded-full border-4 border-border bg-muted shadow-lg'>
              <Image
                src='/authors/AL.png'
                alt='Photo of Al-Hussein, blog author'
                fill
                sizes='128px'
                priority
                className='object-cover object-top scale-110'
              />
            </div>
            <div className='max-w-3xl'>
              <h1
                id='about-hero-heading'
                className='font-medium text-4xl md:text-5xl tracking-tighter mb-2'>
                About This Blog
              </h1>
              <p className='text-muted-foreground text-sm md:text-base lg:text-lg mb-4'>
                Hi, I&apos;m <span className='font-semibold'>al-husayn</span>{' '}
                - developer, writer, and lifelong learner.
              </p>
              <p className='text-muted-foreground text-sm md:text-base lg:text-lg'>
                This blog is a space for sharing practical guides, deep dives,
                and stories from my journey in software development.
              </p>
              <div className='mt-6 flex flex-wrap gap-3 text-xs md:text-sm'>
                <p className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5'>
                  <Code2 className='h-4 w-4 text-primary' />
                  <span className='font-medium'>{allPages.length}</span> published articles
                </p>
                <p className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5'>
                  <Layers className='h-4 w-4 text-primary' />
                  <span className='font-medium'>{topicCount}</span> core topics covered
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto w-full px-6 py-12 relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]'>
        <article className='space-y-6'>
          <div className='rounded-xl border border-border bg-card p-6 space-y-3'>
            <h2 className='text-xl font-semibold tracking-tight'>Mission</h2>
            <p className='text-muted-foreground'>
              The mission is simple: help developers <span className='font-semibold text-foreground'>learn</span>{' '}
              core concepts, <span className='font-semibold text-foreground'>build</span> practical projects, and{' '}
              <span className='font-semibold text-foreground'>share</span> knowledge that helps the next person move
              faster.
            </p>
            <p className='text-muted-foreground'>
              You&apos;ll find practical guides, architecture breakdowns, and lessons from real implementation work,
              written to be useful in day-to-day engineering.
            </p>
          </div>

          <div className='rounded-xl border border-border bg-card p-6 space-y-4'>
            <h2 className='text-xl font-semibold tracking-tight'>Focus Areas</h2>
            <ul className='flex flex-wrap gap-2'>
              {focusAreas.map((area) => (
                <li
                  key={area}
                  className='rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs md:text-sm text-muted-foreground'>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside className='space-y-4'>
          <div className='rounded-xl border border-border bg-card p-5 space-y-4'>
            <h2 className='text-xl font-semibold tracking-tight'>Connect</h2>
            <div className='space-y-2'>
              {connectLinks.map((link) => {
                const Icon = link.icon;

                const linkContent = (
                  <>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/50 shrink-0'>
                      <Icon className='h-4 w-4 text-primary' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block text-sm font-medium'>{link.label}</span>
                      <span className='block text-xs text-muted-foreground'>{link.description}</span>
                    </span>
                    <ArrowUpRight className='h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                  </>
                );

                if (link.external) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors'>
                      {linkContent}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='group flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors'>
                    {linkContent}
                  </Link>
                );
              })}
            </div>
            <Link
              href='/'
              className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80'>
              Browse all articles
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </aside>
      </section>

      {recentPosts.length > 0 && (
        <section className='max-w-7xl mx-auto w-full px-6 pb-14 relative z-10'>
          <div className='rounded-2xl border border-border bg-card overflow-hidden'>
            <div className='p-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <p className='text-xs uppercase tracking-wide text-primary font-semibold'>From the blog</p>
                <h2 className='text-2xl font-semibold tracking-tight'>Featured Reads</h2>
              </div>
              <Link
                href='/'
                className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80'>
                View all
                <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
            <div className='grid md:grid-cols-3 border-t border-border'>
              {recentPosts.map((post, index) => (
                <Link
                  key={post.url}
                  href={post.url}
                  className={`group p-6 space-y-3 border-t border-border md:border-t-0 ${
                    index > 0 ? 'md:border-l md:border-border' : ''
                  }`}>
                  <p className='text-xs text-muted-foreground'>
                    {formatDate(post.data.date)}
                    {post.data.readTime ? ` • ${post.data.readTime}` : ''}
                  </p>
                  <h3 className='text-lg font-semibold tracking-tight group-hover:underline underline-offset-4'>
                    {post.data.title}
                  </h3>
                  <p className='text-sm text-muted-foreground line-clamp-3'>{post.data.description}</p>
                  {post.data.tags && post.data.tags.length > 0 && (
                    <p className='text-xs text-muted-foreground'>{post.data.tags.slice(0, 3).join(' • ')}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
