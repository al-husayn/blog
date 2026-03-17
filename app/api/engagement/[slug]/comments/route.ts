import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createComment, createCommentSchema } from '@/lib/engagement';
import { isEngagementConfigured } from '@/lib/env';

interface RouteContext {
    params: Promise<{
        slug: string;
    }>;
}

const getAuthorName = (user: Awaited<ReturnType<typeof currentUser>>): string => {
    if (!user) {
        return 'Community member';
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

    return (
        fullName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        'Community member'
    );
};

export async function POST(request: Request, { params }: RouteContext) {
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
        return NextResponse.json({ error: 'Sign in to post a comment.' }, { status: 401 });
    }

    let payload: unknown;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Comment payload must be valid JSON.' }, { status: 400 });
    }

    const parsedComment = createCommentSchema.safeParse(payload);

    if (!parsedComment.success) {
        return NextResponse.json(
            { error: parsedComment.error.issues[0]?.message ?? 'Comment is invalid.' },
            { status: 400 },
        );
    }

    try {
        const user = await currentUser();
        const comment = await createComment({
            articleSlug: slug,
            clerkUserId: userId,
            authorName: getAuthorName(user),
            authorImageUrl: user?.imageUrl ?? null,
            message: parsedComment.data.message,
        });

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to post your comment.';

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
