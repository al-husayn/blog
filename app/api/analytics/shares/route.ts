import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createShareEvent } from '@/lib/analytics';
import { isAnalyticsConfigured } from '@/lib/env';

export async function POST(request: Request) {
    if (!isAnalyticsConfigured()) {
        return new Response(null, { status: 204 });
    }

    try {
        const payload = await request.json();
        await createShareEvent(payload);

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    message: 'Invalid share payload.',
                    issues: error.issues,
                },
                { status: 400 },
            );
        }

        console.error('Failed to create share event.', error);
        return NextResponse.json({ message: 'Could not record share event.' }, { status: 500 });
    }
}
