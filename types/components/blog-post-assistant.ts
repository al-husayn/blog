export type AssistantRole = 'user' | 'assistant';

export interface ChatMessage {
    id: string;
    role: AssistantRole;
    content: string;
}

export interface BlogPostAssistantProps {
    slug: string;
    title: string;
}

export interface AssistantResponse {
    answer?: string;
    error?: string;
}
