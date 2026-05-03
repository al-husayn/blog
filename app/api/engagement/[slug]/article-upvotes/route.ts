import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { toggleArticleUpvote } from '@/lib/engagement';
import { isEngagementConfigured } from '@/lib/env';
import type { RouteContext } from '@/types/api/routes';

export async function POST(_request: Request, { params }: RouteContext<{ slug: string }>) {
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
        console.error('[api/engagement/[slug]/article-upvotes] Failed to update article upvote.', {
            slug,
            actor: 'authenticated-user',
            error,
        });

        return NextResponse.json(
            { error: 'Unable to update the article upvote.' },
            { status: 500 },
        );
    }
}
