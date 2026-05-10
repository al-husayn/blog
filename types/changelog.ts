export type ChangelogEntryType = 'major' | 'feature' | 'improvement' | 'fix';

export type ChangelogEntry = {
    version: string;
    date: string;
    title: string;
    type: ChangelogEntryType;
    summary: string;
    changes: string[];
};
