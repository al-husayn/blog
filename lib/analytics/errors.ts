export const isMissingAnalyticsTablesError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const candidate = error as { code?: string; detail?: string; message?: string };
    const messageMentionsAnalyticsTable =
        candidate.message?.includes('article_page_views') === true ||
        candidate.message?.includes('article_share_events') === true;
    const detailMentionsAnalyticsTable =
        candidate.detail?.includes('article_page_views') === true ||
        candidate.detail?.includes('article_share_events') === true;

    return (
        messageMentionsAnalyticsTable ||
        (candidate.code === '42P01' && detailMentionsAnalyticsTable)
    );
};
