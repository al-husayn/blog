import { siteConfig } from '@/lib/site';

export const getAbsoluteUrl = (path = '/'): string => {
    return new URL(path, siteConfig.url).toString();
};

export const getIsoDate = (value: string | Date | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed.toISOString();
};

export const toJsonLd = (value: unknown): string => {
    return JSON.stringify(value).replace(/</g, '\\u003c');
};
