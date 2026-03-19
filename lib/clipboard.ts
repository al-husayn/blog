export async function copyTextToClipboard(value: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch {
            // Fall back to execCommand when the async clipboard API is unavailable or denied.
        }
    }

    if (typeof document === 'undefined') {
        throw new Error('Clipboard is not available in this environment.');
    }

    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';

    document.body.appendChild(textArea);
    textArea.select();

    try {
        const didCopy = document.execCommand('copy');

        if (!didCopy) {
            throw new Error("document.execCommand('copy') returned false.");
        }
    } finally {
        document.body.removeChild(textArea);
    }
}
