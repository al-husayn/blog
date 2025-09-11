"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
        {/* Mobile hamburger */}
        <button
          className='md:hidden flex items-center px-2 py-1'
          onClick={() => setMobileOpen((v) => !v)}
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
        </button>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className='md:hidden bg-background border-b border-border/40 px-6 py-4'>
          <nav className='flex flex-col gap-4'>
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
          </nav>
        </div>
      )}
    </header>
  );
}
