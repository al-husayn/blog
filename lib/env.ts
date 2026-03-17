const hasValue = (value: string | undefined): value is string =>
    typeof value === 'string' && value.trim().length > 0;

export const isDatabaseConfigured = (): boolean => hasValue(process.env.DATABASE_URL);

export const isClerkConfigured = (): boolean =>
    hasValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    hasValue(process.env.CLERK_SECRET_KEY);

export const isEngagementConfigured = (): boolean =>
    isDatabaseConfigured() && isClerkConfigured();
