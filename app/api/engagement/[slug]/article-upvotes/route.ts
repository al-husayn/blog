import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { toggleArticleUpvote } from '@/lib/engagement';
import { isEngagementConfigured } from '@/lib/env';

interface RouteContext {
    params: Promise<{
        slug: string;
    }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ error: 'A valid article slug is required.' }, { status: 400 });
    }

    if (!isEngagementConfigured()) {
        return NextResponse.json(
            {
                error: 'Comments and upvotes require DATABASE_URL plus Clerk keys to be configured.',
            },
            { status: 503 },
        );
    }

    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Sign in to upvote this post.' }, { status: 401 });
    }

    try {
        const result = await toggleArticleUpvote(slug, userId);
        return NextResponse.json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Unable to update the article upvote.';

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
