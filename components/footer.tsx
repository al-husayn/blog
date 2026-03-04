import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BriefcaseBusiness, ExternalLink, Github, Linkedin, Twitter } from 'lucide-react';
import { siteConfig } from '@/lib/site';

interface FooterSocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const footerLinks = {
  navigate: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'RSS Feed', href: '/rss.xml' },
  ],
  social: [
    { label: 'Portfolio', href: siteConfig.creatorUrl, icon: BriefcaseBusiness },
    { label: 'Twitter', href: `https://x.com/${siteConfig.twitterHandle.replace('@', '')}`, icon: Twitter },
    { label: 'LinkedIn', href: siteConfig.linkedinUrl, icon: Linkedin },
    { label: 'GitHub', href: siteConfig.githubUrl, icon: Github },
  ] satisfies FooterSocialLink[],
} as const;

export default function Footer() {
  const currentYear = new Date().getUTCFullYear();
  const linkClass =
    'rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  return (
    <footer className='bg-background border-t border-border'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-2'>
            <h2 className='text-sm font-semibold'>{siteConfig.name}</h2>
            <p className='text-sm text-muted-foreground max-w-sm'>{siteConfig.description}</p>
          </div>

          <div className='space-y-2'>
            <h3 className='text-sm font-semibold'>Navigate</h3>
            <nav aria-label='Footer navigation' className='flex flex-col gap-2 text-sm'>
              {footerLinks.navigate.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className='space-y-2'>
            <h3 className='text-sm font-semibold'>Social</h3>
            <nav aria-label='Footer social links' className='flex flex-col gap-2 text-sm'>
              {footerLinks.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`inline-flex items-center gap-1.5 ${linkClass}`}>
                  <link.icon className='h-3.5 w-3.5' aria-hidden='true' />
                  <span>{link.label}</span>
                  {/* <ExternalLink className='h-3.5 w-3.5' aria-hidden='true' /> */}
                  <span className='sr-only'>(opens in a new tab)</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className='pt-4 border-t border-border flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            &copy; <span suppressHydrationWarning>{currentYear}</span> {siteConfig.creator}.
          </p>
          <p className='text-xs text-muted-foreground'>Built by {siteConfig.creator}.</p>
        </div>
      </div>
    </footer>
  );
}
