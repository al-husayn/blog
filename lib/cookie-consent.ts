import type { CookieConsentStatus } from '@/types/cookie-consent';

export const COOKIE_CONSENT_STORAGE_KEY = 'blog.cookie-consent';
export const COOKIE_CONSENT_CHANGE_EVENT = 'blog:cookie-consent-change';

export const getCookieConsent = (): CookieConsentStatus | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

        return storedValue === 'accepted' || storedValue === 'rejected' ? storedValue : null;
    } catch {
        return null;
    }
};

export const setCookieConsent = (status: CookieConsentStatus): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, status);
    } catch {
        // Consent still applies for the current interaction even if storage is unavailable.
    }

    window.dispatchEvent(
        new CustomEvent<CookieConsentStatus>(COOKIE_CONSENT_CHANGE_EVENT, {
            detail: status,
        }),
    );
};

export const isAnalyticsConsentGranted = (): boolean => getCookieConsent() === 'accepted';
