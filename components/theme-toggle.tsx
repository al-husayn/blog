'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted ? resolvedTheme === 'dark' : false;
    const nextTheme = isDark ? 'light' : 'dark';
    const nextThemeLabel = isDark ? 'light' : 'dark';

    return (
        <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() => setTheme(nextTheme)}
            aria-pressed={isDark}
            aria-label={`Switch to ${nextThemeLabel} theme`}
            title={`Switch to ${nextThemeLabel} theme`}
            className='relative cursor-pointer'
        >
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>{`Switch to ${nextThemeLabel} theme`}</span>
        </Button>
    );
}
