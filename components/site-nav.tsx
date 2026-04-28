'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { MenuIcon } from '@/components/menu';
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'RSS', href: '/rss.xml' },
] as const;

const navLinkClass =
    'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const getNavItemClass = (isActive: boolean): string =>
    cn(
        navLinkClass,
        isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
    );

export function SiteNav() {
    const pathname = usePathname();

    return (
        <header className='sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='max-w-7xl mx-auto w-full flex h-14 items-center justify-between px-6'>
                <div className='mr-4 flex'>
                    <Link
                        href='/'
                        aria-label='Go to home page'
                        title='Home'
                        className='mr-6 flex h-11 w-11 items-center rounded-md overflow-hidden shrink-0'
                    >
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
                <nav
                    aria-label='Primary navigation'
                    className='hidden md:flex items-center flex-1 w-full justify-end gap-2'
                >
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={getNavItemClass(isActive)}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <a
                        href='https://www.al-husayn.dev'
                        className={cn(
                            navLinkClass,
                            'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                        )}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <span>Portfolio</span>
                    </a>
                    <ThemeToggle />
                </nav>

                {/* Mobile nav */}
                <Drawer>
                    <DrawerTrigger
                        className='md:hidden list-none inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                        aria-label='Open menu'
                    >
                        <MenuIcon size={28} className='text-muted-foreground' aria-hidden='true' />
                    </DrawerTrigger>
                    <DrawerContent className='md:hidden !top-14 !bottom-0 !left-0 !right-0 !w-full !mx-0 !max-h-none min-h-[260px] rounded-none border-x-0 border-b-0 shadow-2xl'>
                        <DrawerHeader>
                            <h2 className='text-sm font-semibold'>Menu</h2>
                        </DrawerHeader>
                        <DrawerBody>
                            <nav aria-label='Mobile navigation' className='flex flex-col gap-1'>
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            data-drawer-close='true'
                                            aria-current={isActive ? 'page' : undefined}
                                            className={cn(
                                                'inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                isActive
                                                    ? 'bg-muted text-foreground'
                                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                                <a
                                    href='https://www.al-husayn.dev'
                                    data-drawer-close='true'
                                    className='inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <span>Portfolio</span>
                                </a>
                                <div className='mt-3 flex items-center justify-between rounded-md border px-3 py-2'>
                                    <ThemeToggle />
                                </div>
                            </nav>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </div>
        </header>
    );
}
