export const normalizeNullableString = (value: string | null | undefined): string | null => {
    if (!value) {
        return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
};

export const normalizeHost = (value: string): string => value.toLowerCase().replace(/^www\./, '');

export const prettifyHost = (value: string): string =>
    value
        .replace(/^www\./, '')
        .split('.')
        .slice(0, -1)
        .join('.')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase()) || value;

export const stripReferrerPath = (value: string | null | undefined): string | null => {
    const normalizedValue = normalizeNullableString(value);
    if (!normalizedValue) {
        return null;
    }

    try {
        return new URL(normalizedValue).origin;
    } catch {
        return null;
    }
};
