import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteNav() {
  return (
    <header className='sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='max-w-7xl mx-auto w-full flex h-14 items-center justify-between px-6'>
        <div className='mr-4 flex'>
          <Link
            href='/'
            className='mr-6 flex items-center space-x-2 font-medium text-lg tracking-tighter h-32 w-32 rounded-md overflow-hidden'>
            <Image
              src='/logo.png'
              alt='Logo'
              width={128}
              height={128}
              className='w-32 h-32 object-cover'
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className='hidden md:flex items-center flex-1 w-full justify-end'>
          <a
            href='https://www.al-husayn.dev'
            className='ml-6 text-sm font-medium text-muted-foreground hover:text-foreground mr-6'
            target='_blank'
            rel='noopener noreferrer'>
            Portfolio
          </a>
          <Link
            href='/about'
            className='text-sm font-medium text-muted-foreground hover:text-foreground'>
            About
          </Link>
          <Link
            href='/rss.xml'
            className='ml-6 text-sm font-medium text-muted-foreground hover:text-foreground mr-6'>
            RSS
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile nav using <details> */}
        <details className='md:hidden relative'>
          <summary
            className='list-none flex items-center px-2 py-1 cursor-pointer'
            aria-label='Open menu'>
            <svg
              className='w-7 h-7 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              strokeWidth={2}
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </summary>
          <div className='absolute right-0 mt-2 bg-background border border-border rounded shadow-lg p-4 flex flex-col gap-4 z-50 min-w-[150px]'>
            <a
              href='https://www.al-husayn.dev'
              className='text-sm font-medium text-muted-foreground hover:text-foreground'
              target='_blank'
              rel='noopener noreferrer'>
              Portfolio
            </a>
            <Link
              href='/about'
              className='text-sm font-medium text-muted-foreground hover:text-foreground'>
              About
            </Link>
            <Link
              href='/rss.xml'
              className='text-sm font-medium text-muted-foreground hover:text-foreground'>
              RSS
            </Link>
            <ThemeToggle />
          </div>
        </details>
      </div>
    </header>
  );
}
