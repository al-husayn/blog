import Link from 'next/link';
import { siteConfig } from '@/lib/site';

const footerLinks = {
  navigate: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'RSS Feed', href: '/rss.xml' },
  ],
  social: [
    { label: 'Portfolio', href: siteConfig.creatorUrl },
    { label: 'Twitter', href: `https://x.com/${siteConfig.twitterHandle.replace('@', '')}` },
  ],
} as const;

export default function Footer() {
  const currentYear = new Date().getUTCFullYear();

  return (
      <footer className='bg-background border-t border-border'>
          <div className='max-w-7xl mx-auto p-6 space-y-6'>
              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-2'>
                      <h2 className='text-sm font-semibold'>{siteConfig.name}</h2>
                      <p className='text-sm text-muted-foreground max-w-sm'>
                          {siteConfig.description}
                      </p>
                  </div>

                  <div className='space-y-2'>
                      <h3 className='text-sm font-semibold'>Navigate</h3>
                      <nav aria-label='Footer navigation' className='flex flex-col gap-2 text-sm text-muted-foreground'>
                          {footerLinks.navigate.map((link) => (
                              <Link
                                  key={link.href}
                                  href={link.href}
                                  className='hover:text-foreground transition-colors'
                              >
                                  {link.label}
                              </Link>
                          ))}
                      </nav>
                  </div>

                  <div className='space-y-2'>
                      <h3 className='text-sm font-semibold'>Elsewhere</h3>
                      <nav aria-label='Footer social links' className='flex flex-col gap-2 text-sm text-muted-foreground'>
                          {footerLinks.social.map((link) => (
                              <a
                                  key={link.href}
                                  href={link.href}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='hover:text-foreground transition-colors'
                              >
                                  {link.label}
                              </a>
                          ))}
                      </nav>
                  </div>
              </div>

              <div className='pt-4 border-t border-border flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                  <p className='text-sm text-muted-foreground'>
                      &copy; <span suppressHydrationWarning>{currentYear}</span> {siteConfig.creator}.
                  </p>
                  <p className='text-xs text-muted-foreground'>Built with ❤️ by {siteConfig.creator}.</p>
              </div>
          </div>
      </footer>
  );
}
