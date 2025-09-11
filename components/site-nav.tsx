/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  return (
    <header className='sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='max-w-7xl mx-auto w-full flex h-14 items-center justify-between px-6'>
        <div className='mr-4 flex'>
          <Link
            href='/'
            className='mr-6 flex items-center space-x-2 font-medium text-lg tracking-tighter h-32 w-32 rounded-md overflow-hidden'>
            <img
              src='/logo.png'
              alt='Logo'
              className='w-32 h-32 object-cover'
            />
          </Link>
        </div>

        <div className='flex flex-1 w-full justify-end'>
          <nav className='flex items-center'>
            <a
              href='https://www.al-husayn.dev'
              className='ml-6 text-sm font-medium text-muted-foreground hover:text-foreground mr-6 target:_blank'>
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
        </div>
      </div>
    </header>
  );
}
