import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { toggleCommentUpvote } from '@/lib/engagement';
import { isEngagementConfigured } from '@/lib/env';

interface RouteContext {
    params: Promise<{
        commentId: string;
    }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
    const { commentId } = await params;

    if (!commentId) {
        return NextResponse.json({ error: 'A valid comment id is required.' }, { status: 400 });
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
        return NextResponse.json({ error: 'Sign in to upvote comments.' }, { status: 401 });
    }

    try {
        const result = await toggleCommentUpvote(commentId, userId);

        if (!result) {
            return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[api/engagement/comments/[commentId]/upvote] Failed to update comment upvote.', {
            commentId,
            userId,
            error,
        });

        return NextResponse.json(
            { error: 'Unable to update the comment upvote.' },
            { status: 500 },
        );
    }
}
