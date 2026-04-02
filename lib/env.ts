const hasValue = (value: string | undefined): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const parseCsv = (value: string | undefined): string[] =>
    hasValue(value)
        ? value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
        : [];

const parseLowercaseCsv = (value: string | undefined): string[] =>
    parseCsv(value).map((item) => item.toLowerCase());

export const isDatabaseConfigured = (): boolean => hasValue(process.env.DATABASE_URL);

export const isClerkConfigured = (): boolean =>
    hasValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    hasValue(process.env.CLERK_SECRET_KEY);

export const isEngagementConfigured = (): boolean =>
    isDatabaseConfigured() && isClerkConfigured();

export const isAnalyticsConfigured = (): boolean => isDatabaseConfigured();

export const getAdminUserIds = (): string[] => parseCsv(process.env.ADMIN_USER_IDS);

export const getAdminEmails = (): string[] => parseLowercaseCsv(process.env.ADMIN_EMAILS);

export const isAdminUserId = (userId: string | null | undefined): boolean =>
    userId ? getAdminUserIds().includes(userId) : false;

export const isAdminEmail = (email: string | null | undefined): boolean =>
    email ? getAdminEmails().includes(email.toLowerCase()) : false;

export const isAdminConfigured = (): boolean =>
    getAdminUserIds().length > 0 || getAdminEmails().length > 0;
