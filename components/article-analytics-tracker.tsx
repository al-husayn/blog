'use client';

import { useEffect, useRef } from 'react';
import {
    trackArticlePageViewComplete,
    trackArticlePageViewStart,
} from '@/lib/analytics-client';

const ACTIVE_WINDOW_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 5_000;

interface ArticleAnalyticsTrackerProps {
    articleSlug: string;
    path: string;
}

interface TrackerState {
    pageViewId: string;
    engagedMs: number;
    lastTickAt: number;
    lastInteractionAt: number;
    maxScrollDepth: number;
    reached50: boolean;
    reached75: boolean;
    reached100: boolean;
    finalized: boolean;
}

const createId = (): string =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getScrollDepth = (): number => {
    const documentElement = document.documentElement;
    const totalHeight = Math.max(documentElement.scrollHeight, document.body.scrollHeight);

    if (totalHeight <= window.innerHeight) {
        return 100;
    }

    const viewedHeight = window.scrollY + window.innerHeight;
    return Math.max(0, Math.min(100, Math.round((viewedHeight / totalHeight) * 100)));
};

export function ArticleAnalyticsTracker({
    articleSlug,
    path,
}: ArticleAnalyticsTrackerProps) {
    const stateRef = useRef<TrackerState | null>(null);

    useEffect(() => {
        const updateScrollDepth = () => {
            const state = stateRef.current;

            if (!state) {
                return;
            }

            const scrollDepth = getScrollDepth();
            state.maxScrollDepth = Math.max(state.maxScrollDepth, scrollDepth);
            state.reached50 = state.reached50 || scrollDepth >= 50;
            state.reached75 = state.reached75 || scrollDepth >= 75;
            state.reached100 = state.reached100 || scrollDepth >= 100;
        };

        const finalizeTracking = () => {
            const state = stateRef.current;

            if (!state || state.finalized) {
                return;
            }

            const now = performance.now();

            if (
                document.visibilityState === 'visible' &&
                Date.now() - state.lastInteractionAt <= ACTIVE_WINDOW_MS
            ) {
                state.engagedMs += now - state.lastTickAt;
            }

            state.finalized = true;

            trackArticlePageViewComplete({
                pageViewId: state.pageViewId,
                engagedTimeSeconds: Math.round(state.engagedMs / 1000),
                maxScrollDepth: state.maxScrollDepth,
                reached50: state.reached50,
                reached75: state.reached75,
                reached100: state.reached100,
            });
        };

        const initialTimestamp = performance.now();
        const nextState: TrackerState = {
            pageViewId: createId(),
            engagedMs: 0,
            lastTickAt: initialTimestamp,
            lastInteractionAt: Date.now(),
            maxScrollDepth: 0,
            reached50: false,
            reached75: false,
            reached100: false,
            finalized: false,
        };

        stateRef.current = nextState;
        updateScrollDepth();

        void trackArticlePageViewStart({
            pageViewId: nextState.pageViewId,
            articleSlug,
            path,
        }).catch(() => undefined);

        const markActivity = () => {
            const state = stateRef.current;

            if (!state) {
                return;
            }

            state.lastInteractionAt = Date.now();
            updateScrollDepth();
        };

        const handleVisibilityChange = () => {
            const state = stateRef.current;

            if (!state) {
                return;
            }

            state.lastTickAt = performance.now();

            if (document.visibilityState === 'visible') {
                state.lastInteractionAt = Date.now();
                updateScrollDepth();
            }
        };

        const intervalId = window.setInterval(() => {
            const state = stateRef.current;

            if (!state) {
                return;
            }

            const now = performance.now();
            const delta = now - state.lastTickAt;
            state.lastTickAt = now;

            if (
                document.visibilityState === 'visible' &&
                Date.now() - state.lastInteractionAt <= ACTIVE_WINDOW_MS
            ) {
                state.engagedMs += delta;
            }
        }, HEARTBEAT_INTERVAL_MS);

        window.addEventListener('scroll', markActivity, { passive: true });
        window.addEventListener('pointerdown', markActivity, { passive: true });
        window.addEventListener('touchstart', markActivity, { passive: true });
        window.addEventListener('keydown', markActivity);
        window.addEventListener('resize', updateScrollDepth);
        window.addEventListener('pagehide', finalizeTracking);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('scroll', markActivity);
            window.removeEventListener('pointerdown', markActivity);
            window.removeEventListener('touchstart', markActivity);
            window.removeEventListener('keydown', markActivity);
            window.removeEventListener('resize', updateScrollDepth);
            window.removeEventListener('pagehide', finalizeTracking);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            finalizeTracking();
            stateRef.current = null;
        };
    }, [articleSlug, path]);

    return null;
}
