export class ApiError extends Error {
    status: number;
    payload: unknown;

    constructor(message: string, options: { status: number; payload: unknown }) {
        super(message);
        this.name = 'ApiError';
        this.status = options.status;
        this.payload = options.payload;
    }
}

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const getPayloadErrorMessage = (payload: unknown): string | null => {
    if (
        payload &&
        typeof payload === 'object' &&
        'error' in payload &&
        typeof payload.error === 'string'
    ) {
        return payload.error;
    }

    return null;
};

export const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE;

export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(getPayloadErrorMessage(payload) ?? 'Request failed. Please try again.', {
            status: response.status,
            payload,
        });
    }

    return payload as T;
};

export const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
    const response = await fetch(input, init);
    return parseJsonResponse<T>(response);
};
