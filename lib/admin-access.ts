import 'server-only';

import { auth, currentUser } from '@clerk/nextjs/server';
import {
    isAdminConfigured,
    isAdminEmail,
    isAdminUserId,
    isAnalyticsConfigured,
    isClerkConfigured,
} from '@/lib/env';

export type AdminAccessState =
    | { kind: 'analytics-unconfigured' }
    | { kind: 'clerk-unconfigured' }
    | { kind: 'admin-unconfigured' }
    | { kind: 'signed-out' }
    | { kind: 'forbidden'; userId: string; primaryEmail: string | null }
    | { kind: 'authorized'; userId: string; primaryEmail: string | null };

const getPrimaryEmail = (user: Awaited<ReturnType<typeof currentUser>>): string | null =>
    user?.emailAddresses.find((emailAddress) => emailAddress.id === user.primaryEmailAddressId)
        ?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null;

export const getAdminAccessState = async (): Promise<AdminAccessState> => {
    if (!isAnalyticsConfigured()) {
        return { kind: 'analytics-unconfigured' };
    }

    if (!isClerkConfigured()) {
        return { kind: 'clerk-unconfigured' };
    }

    if (!isAdminConfigured()) {
        return { kind: 'admin-unconfigured' };
    }

    const { userId } = await auth();

    if (!userId) {
        return { kind: 'signed-out' };
    }

    const user = await currentUser();
    const primaryEmail = getPrimaryEmail(user);

    if (isAdminUserId(userId) || isAdminEmail(primaryEmail)) {
        return {
            kind: 'authorized',
            userId,
            primaryEmail,
        };
    }

    return {
        kind: 'forbidden',
        userId,
        primaryEmail,
    };
};

export const getAdminAccessError = (
    accessState: Exclude<AdminAccessState, { kind: 'authorized' }>,
): { message: string; status: number } => {
    switch (accessState.kind) {
        case 'analytics-unconfigured':
            return {
                status: 503,
                message:
                    'Analytics storage is not configured. Add a DATABASE_URL before requesting dashboard data.',
            };
        case 'clerk-unconfigured':
            return {
                status: 503,
                message:
                    'Authentication is not configured. Add Clerk keys before requesting dashboard data.',
            };
        case 'admin-unconfigured':
            return {
                status: 503,
                message:
                    'Admin access has not been assigned yet. Set ADMIN_USER_IDS or ADMIN_EMAILS first.',
            };
        case 'signed-out':
            return {
                status: 401,
                message: 'Sign in to view admin analytics.',
            };
        case 'forbidden':
            return {
                status: 403,
                message:
                    'This account does not have dashboard access. Add the current user ID or email to ADMIN_USER_IDS or ADMIN_EMAILS.',
            };
    }
};
