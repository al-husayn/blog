import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { GoeyToaster } from '@/components/ui/goey-toaster';
import { siteConfig } from '@/lib/site';
import { metadataKeywords } from '@/app/metadata';
import { SiteNav } from '@/components/site-nav';
import Footer from '@/components/footer';
import { getAbsoluteUrl, toJsonLd } from '@/lib/seo';
import { isClerkConfigured } from '@/lib/env';
import 'goey-toast/styles.css';
import './globals.css';

export const viewport: Viewport = {
    themeColor: 'black',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...metadataKeywords],
    authors: [
        {
            name: siteConfig.creator,
            url: siteConfig.creatorUrl,
        },
    ],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    category: 'technology',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: '/',
        languages: {
            'en-US': '/',
        },
        types: {
            'application/rss+xml': getAbsoluteUrl('/rss.xml'),
        },
    },
    openGraph: {
        type: 'website',
        locale: siteConfig.locale,
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: getAbsoluteUrl(siteConfig.ogImage),
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        creator: siteConfig.twitterHandle,
        site: siteConfig.twitterHandle,
        images: [getAbsoluteUrl(siteConfig.ogImage)],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
};

const globalStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebSite',
            '@id': getAbsoluteUrl('/#website'),
            url: siteConfig.url,
            name: siteConfig.name,
            description: siteConfig.description,
            inLanguage: siteConfig.language,
        },
        {
            '@type': 'Organization',
            '@id': getAbsoluteUrl('/#organization'),
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
                '@type': 'ImageObject',
                url: getAbsoluteUrl(siteConfig.logo),
            },
        },
        {
            '@type': 'Person',
            '@id': getAbsoluteUrl('/#person'),
            name: siteConfig.creator,
            url: siteConfig.creatorUrl,
            image: getAbsoluteUrl('/authors/AL.png'),
            sameAs: [
                siteConfig.creatorUrl,
                siteConfig.githubUrl,
                siteConfig.linkedinUrl,
                `https://x.com/${siteConfig.twitterHandle.replace('@', '')}`,
                siteConfig.buyMeACoffeeUrl,
            ],
        },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const shouldEnableClerk = isClerkConfigured();
    const appShell = (
        <>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: toJsonLd(globalStructuredData),
                }}
            />
            <ThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
                disableTransitionOnChange
            >
                <QueryProvider>
                    <SiteNav />
                    {children}
                    <Footer />
                    <GoeyToaster />
                </QueryProvider>
            </ThemeProvider>
        </>
    );

    return (
        <html
            lang='en'
            className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
            suppressHydrationWarning
        >
            <body suppressHydrationWarning>
                {shouldEnableClerk ? <ClerkProvider>{appShell}</ClerkProvider> : appShell}
            </body>
        </html>
    );
}
