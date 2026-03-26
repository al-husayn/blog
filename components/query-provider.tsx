'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const STALE_TIME_MS = 30 * 1000;
const GC_TIME_MS = 5 * 60 * 1000;

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: STALE_TIME_MS,
                gcTime: GC_TIME_MS,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                retry: 1,
            },
            mutations: {
                retry: 0,
            },
        },
    });

let browserQueryClient: QueryClient | undefined;

const getQueryClient = (): QueryClient => {
    if (isServer) {
        return createQueryClient();
    }

    browserQueryClient ??= createQueryClient();
    return browserQueryClient;
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
