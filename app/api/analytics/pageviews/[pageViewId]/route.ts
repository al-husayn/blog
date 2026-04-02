import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { completePageView } from '@/lib/analytics';
import { isAnalyticsConfigured } from '@/lib/env';

interface RouteContext {
    params: Promise<{
        pageViewId: string;
    }>;
}

export async function POST(request: Request, { params }: RouteContext) {
    const { pageViewId } = await params;

    if (!isAnalyticsConfigured()) {
        return new Response(null, { status: 204 });
    }

    try {
        const payload = await request.json();
        await completePageView({ ...payload, pageViewId });

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    message: 'Invalid page view completion payload.',
                    issues: error.issues,
                },
                { status: 400 },
            );
        }

        console.error('Failed to finalize page view.', error);
        return NextResponse.json({ message: 'Could not finalize page view.' }, { status: 500 });
    }
}
