import { FlickeringGrid } from '@/components/magicui/flickering-grid';

export function BackgroundGrid() {
    return (
        <div
            aria-hidden='true'
            className='absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]'
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
    );
}
