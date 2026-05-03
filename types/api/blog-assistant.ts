import type { AssistantRole } from '@/types/components/blog-post-assistant';

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

export interface AskBlogAssistantInput {
    slug: string;
    message: string;
    userName?: string;
    history: Array<{
        role: AssistantRole;
        content: string;
    }>;
}

export interface CloudMessage {
    role: string;
    content: string;
}

export interface RequestCloudCompletionInput {
    apiBaseUrl: string;
    apiKey: string;
    model: string;
    messages: CloudMessage[];
    referer: string;
    title: string;
}

export interface CloudCompletionResult {
    ok: boolean;
    payload: CloudChatCompletionResponse | null;
    providerError: string;
}
