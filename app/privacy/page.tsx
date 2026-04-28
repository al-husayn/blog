import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { getAbsoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Privacy',
    description: 'Read the privacy policy for Learn. Build. Share.',
    alternates: {
        canonical: '/privacy',
    },
    openGraph: {
        title: `Privacy | ${siteConfig.name}`,
        description: 'Read the privacy policy for Learn. Build. Share.',
        type: 'website',
        url: getAbsoluteUrl('/privacy'),
        images: [getAbsoluteUrl(siteConfig.ogImage)],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Privacy | ${siteConfig.name}`,
        description: 'Read the privacy policy for Learn. Build. Share.',
        creator: siteConfig.twitterHandle,
        images: [getAbsoluteUrl(siteConfig.ogImage)],
    },
};

const lastUpdatedLabel = 'April 22, 2026';

const privacySections = [
    {
        title: 'Information We Collect',
        paragraphs: [
            'We may collect personal information you voluntarily provide, such as your name, email address, or other details you submit through forms or direct communications.',
            'We may also collect certain non-personal information automatically, such as browser type, device information, IP address, and pages visited, to help us understand and improve how the website is used.',
        ],
    },
    {
        title: 'How We Use Information',
        paragraphs: [
            'Information may be used to operate, maintain, and improve the website and its content.',
            'We may also use information to respond to inquiries, provide support, communicate important updates, and protect the security and integrity of the website.',
            'Aggregated or non-identifiable information may be used for analysis, research, and general business purposes.',
        ],
    },
    {
        title: 'Cookies and Analytics',
        paragraphs: [
            'This website may use cookies and similar technologies to improve functionality, remember preferences, and understand general website traffic and usage patterns.',
            'You can usually control cookies through your browser settings. Disabling cookies may affect how some parts of the website function.',
        ],
    },
    {
        title: 'Sharing of Information',
        paragraphs: [
            'We do not sell your personal information.',
            'We may share information with service providers or trusted third parties who help us operate the website, provided they handle that information appropriately.',
            'We may also disclose information if required by law or when necessary to protect our rights, safety, or property.',
        ],
    },
    {
        title: 'Data Security',
        paragraphs: [
            'Reasonable administrative, technical, and organizational measures are used to help protect information handled through the website.',
            'However, no method of transmission or storage is completely secure, and absolute security cannot be guaranteed.',
        ],
    },
    {
        title: 'Your Choices',
        paragraphs: [
            'You may choose not to provide personal information, and you may adjust your browser settings to manage cookies or similar technologies.',
            'Depending on your location and applicable law, you may have the right to request access to, correction of, or deletion of personal information you have provided.',
            'If you would like to make a privacy-related request, you can use the contact link below.',
        ],
    },
    {
        title: 'Third-Party Links',
        paragraphs: [
            'This website may contain links to third-party websites or services.',
            'We are not responsible for the privacy practices of those third parties, and we encourage you to review their privacy policies before providing them with personal information.',
        ],
    },
    {
        title: 'Changes to This Policy',
        paragraphs: [
            'This privacy policy may be updated from time to time to reflect changes in data collection practices or regulatory requirements.',
            'Any changes will be reflected on this page with a revised effective date.',
        ],
    },
] as const;

export default function PrivacyPage() {
    return (
        <main className='min-h-screen bg-background relative'>
            <section
                aria-labelledby='privacy-hero-heading'
                className='border-b border-border relative overflow-hidden'
            >
                <div
                    aria-hidden='true'
                    className='absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)] pointer-events-none'
                >
                    <FlickeringGrid
                        className='absolute top-0 left-0 size-full'
                        squareSize={4}
                        gridGap={6}
                        color='var(--muted-foreground)'
                        maxOpacity={0.2}
                        flickerChance={0.05}
                    />
                </div>

                <div className='max-w-7xl mx-auto px-6 py-14 relative z-10'>
                    <div className='max-w-3xl space-y-4'>
                        <p className='text-xs uppercase tracking-[0.2em] text-primary font-semibold'>
                            Privacy Policy
                        </p>
                        <h1
                            id='privacy-hero-heading'
                            className='font-medium text-4xl md:text-5xl tracking-tighter'
                        >
                            Your privacy matters.
                        </h1>
                        <p className='text-sm md:text-base lg:text-lg text-muted-foreground'>
                            This page explains, in general terms, how information may be collected,
                            used, and protected when you visit and interact with this website.
                        </p>
                        <p className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs md:text-sm text-muted-foreground'>
                            <ShieldCheck className='h-4 w-4 text-primary' aria-hidden='true' />
                            Last updated {lastUpdatedLabel}
                        </p>
                    </div>
                </div>
            </section>

            <section className='max-w-7xl mx-auto w-full px-6 py-12 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]'>
                <article className='space-y-6'>
                    {privacySections.map((section) => (
                        <section
                            key={section.title}
                            className='rounded-2xl border border-border bg-card p-6 space-y-3'
                        >
                            <h2 className='text-2xl font-semibold tracking-tight'>
                                {section.title}
                            </h2>
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph} className='text-muted-foreground'>
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    ))}
                </article>

                <aside className='space-y-4'>
                    <div className='rounded-2xl border border-border bg-card p-5 space-y-4'>
                        <h2 className='text-xl font-semibold tracking-tight'>Quick Summary</h2>
                        <div className='space-y-3 text-sm text-muted-foreground'>
                            <p className='rounded-xl border border-border bg-background px-4 py-3'>
                                Information may be collected to operate, maintain, and improve the
                                website.
                            </p>
                            <p className='rounded-xl border border-border bg-background px-4 py-3'>
                                Cookies or similar technologies may be used for functionality and
                                general usage insights.
                            </p>
                            <p className='rounded-xl border border-border bg-background px-4 py-3'>
                                You may contact us to ask questions or make privacy-related
                                requests.
                            </p>
                        </div>
                    </div>

                    <div className='rounded-2xl border border-border bg-card p-5 space-y-4'>
                        <h2 className='text-xl font-semibold tracking-tight'>Contact</h2>
                        <p className='text-sm text-muted-foreground'>
                            If you have questions about this privacy policy or would like to make a
                            request relating to your information, please get in touch.
                        </p>
                        <div className='flex flex-col gap-2'>
                            <a
                                href={siteConfig.creatorUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40'
                            >
                                Contact via portfolio
                                <span className='sr-only'>(opens in a new tab)</span>
                                <ArrowUpRight className='h-4 w-4 text-primary' aria-hidden='true' />
                            </a>
                            <Link
                                href='/'
                                className='inline-flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/40'
                            >
                                Return to the blog
                                <ArrowUpRight className='h-4 w-4 text-primary' aria-hidden='true' />
                            </Link>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
