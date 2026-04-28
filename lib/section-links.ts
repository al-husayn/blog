import { copyTextToClipboard } from '@/lib/clipboard';

const DEFAULT_SECTION_SCROLL_OFFSET = 80;

export const createSectionUrl = (id: string): string =>
    `${window.location.origin}${window.location.pathname}#${id}`;

export const updateSectionHash = (id: string): void => {
    window.history.pushState({}, '', `#${id}`);
};

export const scrollToSection = (id: string, offset = DEFAULT_SECTION_SCROLL_OFFSET): boolean => {
    const element = document.getElementById(id);

    if (!element) {
        return false;
    }

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
    });

    return true;
};

export const copySectionLink = async (id: string): Promise<string> => {
    const url = createSectionUrl(id);
    await copyTextToClipboard(url);
    return url;
};
