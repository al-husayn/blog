import type { Metadata } from 'next';
import { ArticlesSection } from '@/components/home/articles-section';
import { BackgroundGrid } from '@/components/home/background-grid';
import { FeaturedPost } from '@/components/home/featured-post';
import { HeroSection } from '@/components/home/hero-section';
import { buildBlogListJsonLd, getHomePageData, getMetadataContent } from '@/lib/home-page';
import { getAbsoluteUrl, toJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import type { HomePageRouteProps } from '@/types/pages/home';

export async function generateMetadata({ searchParams }: HomePageRouteProps): Promise<Metadata> {
    const metadata = getMetadataContent(await searchParams);
    const absoluteImageUrl = getAbsoluteUrl(siteConfig.ogImage);

    return {
        title: metadata.title,
        description: metadata.description,
        alternates: {
            canonical: metadata.canonicalPath,
        },
        openGraph: {
            title: metadata.title,
            description: metadata.description,
            type: 'website',
            url: getAbsoluteUrl(metadata.canonicalPath),
            images: [absoluteImageUrl],
        },
        twitter: {
            card: 'summary_large_image',
            title: metadata.title,
            description: metadata.description,
            creator: siteConfig.twitterHandle,
            images: [absoluteImageUrl],
        },
        robots: metadata.shouldHideFromIndex
            ? {
                  index: false,
                  follow: true,
              }
            : undefined,
    };
}

export const revalidate = 3600;

export default async function HomePage({ searchParams }: HomePageRouteProps) {
    const pageData = getHomePageData(await searchParams);

    return (
        <main role='main' className='min-h-screen bg-background relative'>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: toJsonLd(buildBlogListJsonLd(pageData.visibleBlogs)),
                }}
            />
            <BackgroundGrid />
            <HeroSection
                allTags={pageData.allTags}
                tagCounts={pageData.tagCounts}
                searchQuery={pageData.searchQuery}
                selectedTag={pageData.selectedTag}
            />
            {pageData.showFeaturedPost && pageData.featuredBlog && (
                <FeaturedPost blog={pageData.featuredBlog} />
            )}
            <ArticlesSection
                paginatedBlogs={pageData.paginatedBlogs}
                emptyStateLabel={pageData.emptyStateLabel}
                resultsSummaryLabel={pageData.resultsSummaryLabel}
                resultsContextLabel={pageData.resultsContextLabel}
                currentPage={pageData.currentPage}
                totalPages={pageData.totalPages}
                paginationItems={pageData.paginationItems}
                searchQuery={pageData.searchQuery}
                selectedTag={pageData.selectedTag}
            />
        </main>
    );
}
