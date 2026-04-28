import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getEngagement } from '@/lib/engagement';
import { isClerkConfigured, isDatabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

interface RouteContext {
    params: Promise<{
        slug: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ error: 'A valid article slug is required.' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
        return NextResponse.json(
            { error: 'Engagement is unavailable until DATABASE_URL is configured.' },
            { status: 503 },
        );
    }

    try {
        const clerkUserId = isClerkConfigured() ? ((await auth()).userId ?? undefined) : undefined;
        const engagement = await getEngagement(slug, clerkUserId);

        return NextResponse.json(engagement);
    } catch (error) {
        console.error('[api/engagement/[slug]] Failed to load engagement.', {
            slug,
            error,
        });

        return NextResponse.json(
            { error: 'Unable to load engagement right now.' },
            { status: 500 },
        );
    }
}
