import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createPageView } from '@/lib/analytics';
import { isAnalyticsConfigured } from '@/lib/env';

export async function POST(request: Request) {
    if (!isAnalyticsConfigured()) {
        return new Response(null, { status: 204 });
    }

    try {
        const payload = await request.json();
        await createPageView(payload);

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    message: 'Invalid page view payload.',
                    issues: error.issues,
                },
                { status: 400 },
            );
        }

        console.error('Failed to create page view.', error);
        return NextResponse.json({ message: 'Could not record page view.' }, { status: 500 });
    }
}
