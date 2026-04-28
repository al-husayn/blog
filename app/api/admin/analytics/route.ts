import { NextResponse } from 'next/server';
import { getAdminAccessError, getAdminAccessState } from '@/lib/admin-access';
import { getDashboardAnalytics, isMissingAnalyticsTablesError } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET() {
    const accessState = await getAdminAccessState();

    if (accessState.kind !== 'authorized') {
        const error = getAdminAccessError(accessState);

        return NextResponse.json(
            {
                error: error.message,
            },
            { status: error.status },
        );
    }

    try {
        const analytics = await getDashboardAnalytics();
        return NextResponse.json(analytics);
    } catch (error) {
        if (isMissingAnalyticsTablesError(error)) {
            return NextResponse.json(
                {
                    error: 'Analytics tables have not been applied yet. Run pnpm db:push or your preferred Drizzle migration flow, then refresh /admin.',
                },
                { status: 503 },
            );
        }

        console.error('[api/admin/analytics] Failed to load dashboard analytics.', {
            actor: 'authenticated-admin',
            userId: accessState.userId,
            error,
        });

        return NextResponse.json(
            {
                error: 'Unable to load analytics right now.',
            },
            { status: 500 },
        );
    }
}
