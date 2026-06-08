'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { GooeyToaster } from 'goey-toast';

export function GoeyToaster() {
    const { resolvedTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(id);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <GooeyToaster
            position='bottom-center'
            preset='smooth'
            closeButton='top-right'
            visibleToasts={10}
            offset='24px'
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        />
    );
}
