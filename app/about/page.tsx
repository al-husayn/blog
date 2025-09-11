import { HashScrollHandler } from '@/components/hash-scroll-handler';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className='max-w-3xl mx-auto px-6 py-16'>
      <div className='flex flex-col md:flex-row items-center gap-8'>
        <HashScrollHandler />
        <div className="absolute top-0 left-0 z-0 w-full h-[200px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
                <FlickeringGrid
                  className="absolute top-0 left-0 size-full"
                  squareSize={4}
                  gridGap={6}
                  color="#6B7280"
                  maxOpacity={0.2}
                  flickerChance={0.05}
                />
              </div>
        <Image
          src='/authors/AL.png'
          alt='al-husayn'
          width={120}
          height={120}
          className='rounded-full border-4 border-border shadow-lg'
        />
        <div>
          <h1 className='text-3xl font-bold mb-2'>About This Blog</h1>
          <p className='text-muted-foreground mb-4'>
            Hi, I’m <span className='font-semibold'>al-husayn</span> —
            developer, writer, and lifelong learner.
          </p>
          <p className='mb-2'>
            This blog is a space for sharing practical guides, deep dives, and
            stories from my journey in software development. My goal is to help
            you <span className='font-semibold'>learn</span> new skills,{' '}
            <span className='font-semibold'>build</span> real projects, and{' '}
            <span className='font-semibold'>share</span> what you discover.
          </p>
          <p>
            Whether you’re just starting out or looking to level up, you’ll find
            resources here to inspire and support your growth.
          </p>
        </div>
      </div>
      <section className='mt-10'>
        <h2 className='text-xl font-semibold mb-2'>What You'll Find Here</h2>
        <ul className='list-disc list-inside text-muted-foreground space-y-1'>
          <li>
            In-depth tutorials on JavaScript, TypeScript, and web technologies, Blockchain & Crypto and more ...
          </li>
          <li>Project-based learning and code walkthroughs</li>
          <li>Tips, tricks, and lessons learned from real-world experience</li>
          <li>Occasional thoughts on productivity and developer mindset</li>
        </ul>
      </section>
      <section className='mt-10'>
        <h2 className='text-xl font-semibold mb-2'>Connect</h2>
        <p>
          Want to chat or collaborate? Reach out on{' '}
          <a
            href='https://www.al-husayn.dev'
            className='text-primary underline'
            target='_blank'
            rel='noopener noreferrer'>
            my portfolio
          </a>
          .
        </p>
      </section>
    </main>
  );
}
