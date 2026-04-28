export interface CloudChatCompletionResponse {
    choices?: Array<{
        message?: {
            role?: string;
            content?: string | Array<{ type?: string; text?: string }>;
        };
    }>;
    error?: {
        message?: string;
    };
}

export interface ArticleContext {
    title: string;
    description: string;
    tags: string[];
    body: string;
}
