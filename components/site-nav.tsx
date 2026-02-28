import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { MenuIcon } from '@/components/menu';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer';

export function SiteNav() {
  return (
    <header className='sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='max-w-7xl mx-auto w-full flex h-14 items-center justify-between px-6'>
        <div className='mr-4 flex'>
          <Link
            href='/'
            aria-label='Go to home page'
            title='Home'
            className='mr-6 flex h-11 w-11 items-center rounded-md overflow-hidden shrink-0'>
            <Image
              src='/logo.png'
              alt=''
              aria-hidden='true'
              width={44}
              height={44}
              sizes='44px'
              className='h-11 w-11 object-cover'
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav aria-label='Primary navigation' className='hidden md:flex items-center flex-1 w-full justify-end gap-6'>
          <Link
            href='/'
            className='text-sm font-medium text-muted-foreground hover:text-foreground'>
            Home
          </Link>
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

        {/* Mobile nav */}
        <Drawer>
          <DrawerTrigger
            className='md:hidden list-none flex items-center px-2 py-1 cursor-pointer'
            aria-label='Open menu'>
            <MenuIcon size={28} className='text-muted-foreground' aria-hidden='true' />
          </DrawerTrigger>
          <DrawerContent className='md:hidden !top-14 !bottom-0 !left-0 !right-0 !w-full !mx-0 !max-h-none min-h-[260px] rounded-none border-x-0 border-b-0 shadow-2xl'>
            <DrawerHeader>
              <h2 className='text-sm font-semibold'>Menu</h2>
            </DrawerHeader>
            <DrawerBody>
              <nav aria-label='Mobile navigation' className='flex flex-col gap-4'>
                <Link
                  href='/'
                  data-drawer-close='true'
                  className='text-sm font-medium text-muted-foreground hover:text-foreground'>
                  Home
                </Link>
                <a
                  href='https://www.al-husayn.dev'
                  data-drawer-close='true'
                  className='text-sm font-medium text-muted-foreground hover:text-foreground'
                  target='_blank'
                  rel='noopener noreferrer'>
                  Portfolio
                </a>
                <Link
                  href='/about'
                  data-drawer-close='true'
                  className='text-sm font-medium text-muted-foreground hover:text-foreground'>
                  About
                </Link>
                <Link
                  href='/rss.xml'
                  data-drawer-close='true'
                  className='text-sm font-medium text-muted-foreground hover:text-foreground'>
                  RSS
                </Link>
                <ThemeToggle />
              </nav>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
