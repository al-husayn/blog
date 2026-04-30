export const isMissingAnalyticsTablesError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const candidate = error as { code?: string; message?: string };

    return (
        candidate.code === '42P01' ||
        candidate.message?.includes('article_page_views') === true ||
        candidate.message?.includes('article_share_events') === true
    );
};
