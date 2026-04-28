import type React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { LockKeyhole, Settings2 } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { Button } from '@/components/ui/button';
import { getAdminAccessState } from '@/lib/admin-access';
import { adminAnalyticsQueryKey } from '@/lib/api/admin-analytics';
import { getDashboardAnalytics, isMissingAnalyticsTablesError } from '@/lib/analytics';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    robots: {
        index: false,
        follow: false,
    },
};

export const dynamic = 'force-dynamic';

function AccessState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <main className='relative min-h-screen overflow-hidden bg-background'>
            <div
                aria-hidden='true'
                className='absolute inset-x-0 top-0 h-[220px] [mask-image:linear-gradient(to_top,transparent_18%,black_95%)]'
            >
                <FlickeringGrid
                    className='absolute inset-0 h-full w-full'
                    squareSize={4}
                    gridGap={6}
                    color='var(--muted-foreground)'
                    maxOpacity={0.2}
                    flickerChance={0.05}
                />
            </div>
            <div className='relative mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 sm:py-12'>
                <section className='w-full rounded-[32px] border border-border/70 bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur sm:p-10'>
                    <div className='inline-flex rounded-2xl border border-border/70 bg-background/70 p-4'>
                        {icon}
                    </div>
                    <h1 className='mt-6 text-3xl font-semibold tracking-tight'>{title}</h1>
                    <p className='mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base'>
                        {description}
                    </p>
                    <div className='mt-6 flex flex-wrap gap-3'>
                        <Button asChild>
                            <Link href='/'>Back to site</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default async function AdminDashboardPage() {
    const accessState = await getAdminAccessState();

    switch (accessState.kind) {
        case 'analytics-unconfigured':
            return (
                <AccessState
                    icon={<Settings2 className='h-6 w-6 text-muted-foreground' />}
                    title='Analytics storage is not configured'
                    description='Add a DATABASE_URL so page views, traffic sources, scroll depth, and share events can be recorded for the dashboard.'
                />
            );
        case 'clerk-unconfigured':
            return (
                <AccessState
                    icon={<LockKeyhole className='h-6 w-6 text-muted-foreground' />}
                    title='Authentication is required for admin access'
                    description='Configure Clerk keys so the admin dashboard can verify who is signed in before serving private analytics data.'
                />
            );
        case 'admin-unconfigured':
            return (
                <AccessState
                    icon={<Settings2 className='h-6 w-6 text-muted-foreground' />}
                    title='Admin access has not been assigned yet'
                    description='Set ADMIN_USER_IDS or ADMIN_EMAILS in your environment to define who can access this dashboard.'
                />
            );
        case 'signed-out':
            return (
                <AccessState
                    icon={<LockKeyhole className='h-6 w-6 text-muted-foreground' />}
                    title='Sign in to view the dashboard'
                    description='This dashboard is private to the blog author account, so you need an authenticated admin session before analytics data is shown.'
                />
            );
        case 'forbidden':
            return (
                <AccessState
                    icon={<LockKeyhole className='h-6 w-6 text-muted-foreground' />}
                    title='This account does not have dashboard access'
                    description={`The signed-in account is not listed in ADMIN_USER_IDS or ADMIN_EMAILS. Current user ID: ${accessState.userId}${accessState.primaryEmail ? `. Current email: ${accessState.primaryEmail}.` : '.'}`}
                />
            );
        case 'authorized':
            break;
    }

    try {
        const analytics = await getDashboardAnalytics();
        const queryClient = new QueryClient();
        queryClient.setQueryData(adminAnalyticsQueryKey, analytics);

        return (
            <main className='relative min-h-screen overflow-hidden bg-background'>
                <div
                    aria-hidden='true'
                    className='absolute inset-x-0 top-0 h-[220px] [mask-image:linear-gradient(to_top,transparent_18%,black_95%)]'
                >
                    <FlickeringGrid
                        className='absolute inset-0 h-full w-full'
                        squareSize={4}
                        gridGap={6}
                        color='var(--muted-foreground)'
                        maxOpacity={0.2}
                        flickerChance={0.05}
                    />
                </div>
                <div className='relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10'>
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <AnalyticsDashboard />
                    </HydrationBoundary>
                </div>
            </main>
        );
    } catch (error) {
        if (isMissingAnalyticsTablesError(error)) {
            return (
                <AccessState
                    icon={<Settings2 className='h-6 w-6 text-muted-foreground' />}
                    title='Analytics tables have not been applied yet'
                    description='The dashboard code is in place, but your database is still missing the analytics tables. Run `pnpm db:push` or your preferred Drizzle migration flow, then refresh `/admin`.'
                />
            );
        }

        throw error;
    }
}
