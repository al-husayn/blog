import type { Metadata } from 'next';
import { HashScrollHandler } from '@/components/hash-scroll-handler';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import Image from 'next/image';
import { siteConfig } from '@/lib/site';
import { getAbsoluteUrl } from '@/lib/seo';

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

export default function AboutPage() {
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
                alt='Al-Hussein'
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
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-3xl mx-auto w-full px-6 py-12 relative z-10'>
        <p className='mb-2'>
          My goal is to help you <span className='font-semibold'>learn</span>{' '}
          new skills, <span className='font-semibold'>build</span> real
          projects, and <span className='font-semibold'>share</span> what you
          discover.
        </p>
        <p>
          Whether you&apos;re just starting out or looking to level up,
          you&apos;ll find resources here to inspire and support your growth.
        </p>

        <section className='mt-10'>
          <h2 className='text-xl font-semibold mb-2'>
            What You&apos;ll Find Here
          </h2>
          <ul className='list-disc list-inside text-muted-foreground space-y-1'>
            <li>
              In-depth tutorials on JavaScript, TypeScript, and web
              technologies, Blockchain &amp; Crypto...etc
            </li>
            <li>Project-based learning and code walkthroughs</li>
            <li>
              Tips, tricks, and lessons learned from real-world experience
            </li>
            <li>Occasional thoughts on productivity and developer mindset</li>
          </ul>
        </section>

        <section className='mt-10'>
          <h2 className='text-xl font-semibold mb-2'>Connect</h2>
          <p>
            Want to chat or collaborate? Reach out on{' '}
            <a
              href='https://www.al-husayn.dev'
              className='text-primary underline'
              target='_blank'
              rel='noopener noreferrer'>
              my portfolio
            </a>
            .
          </p>
        </section>
      </section>
    </main>
  );
}
