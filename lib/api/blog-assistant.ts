import { requestJson } from '@/lib/api/client';
import type { AskBlogAssistantInput } from '@/types/api/blog-assistant';
import type { AssistantResponse } from '@/types/components/blog-post-assistant';

export const askBlogAssistant = async ({
    slug,
    message,
    userName,
    history,
}: AskBlogAssistantInput): Promise<string> => {
    const payload = await requestJson<AssistantResponse>('/api/blog-assistant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            slug,
            message,
            userName,
            history,
        }),
    });

    if (!payload.answer) {
        throw new Error(
            payload.error || "I couldn't generate a response right now. Please try again.",
        );
    }

    return payload.answer;
};
