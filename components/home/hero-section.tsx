import { TagFilter } from '@/components/tag-filter';
import { SearchForm } from '@/components/home/search-form';
import { ARTICLES_PANEL_ID, type HomePageData } from '@/lib/home-page';

export function HeroSection({
    allTags,
    tagCounts,
    searchQuery,
    selectedTag,
}: Pick<HomePageData, 'allTags' | 'tagCounts' | 'searchQuery' | 'selectedTag'>) {
    return (
        <section
            aria-labelledby='home-hero-heading'
            className='p-6 border-b border-border flex flex-col gap-6 min-h-[250px] justify-center relative z-10'
        >
            <div className='max-w-7xl mx-auto w-full'>
                <div className='flex flex-col gap-2'>
                    <h1
                        id='home-hero-heading'
                        className='font-medium text-4xl md:text-5xl tracking-tighter'
                    >
                        Learn. Build. Share.
                    </h1>
                    <p className='text-muted-foreground text-sm md:text-base lg:text-lg'>
                        A space for developers to grow their skills, build real projects, and share
                        stories that inspire others.
                    </p>
                </div>
            </div>

            {allTags.length > 0 && (
                <div className='max-w-7xl mx-auto w-full flex flex-col gap-3'>
                    <SearchForm searchQuery={searchQuery} selectedTag={selectedTag} />
                    <TagFilter
                        tags={allTags}
                        selectedTag={selectedTag}
                        tagCounts={tagCounts}
                        panelId={ARTICLES_PANEL_ID}
                    />
                </div>
            )}
        </section>
    );
}
