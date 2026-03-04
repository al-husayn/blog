'use client';

import { cn } from '@/lib/utils';
import { Menu as MenuLucide } from 'lucide-react';
import type { Variants } from 'motion/react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { MenuIconHandle, MenuIconProps } from '@/types/components/menu';

const MenuIcon = forwardRef<MenuIconHandle, MenuIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
        const controls = useAnimation();
        const reduced = useReducedMotion();
        const isControlled = useRef(false);

        useImperativeHandle(ref, () => {
            isControlled.current = true;
            return {
                startAnimation: () =>
                    reduced ? controls.start('normal') : controls.start('animate'),
                stopAnimation: () => controls.start('normal'),
            };
        });

        const handleEnter = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (reduced) return;
                if (!isControlled.current) {
                    controls.start('animate');
                } else {
                    onMouseEnter?.(e);
                }
            },
            [controls, onMouseEnter, reduced],
        );

        const handleLeave = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!isControlled.current) {
                    controls.start('normal');
                } else {
                    onMouseLeave?.(e);
                }
            },
            [controls, onMouseLeave],
        );

        const iconVariants: Variants = {
            normal: { scale: 1, rotate: 0, opacity: 1 },
            animate: {
                scale: [1, 1.12, 1],
                rotate: [0, 6, -6, 0],
                opacity: [1, 0.85, 1],
                transition: { duration: 0.4 },
            },
        };

        return (
            <motion.div
                className={cn('inline-flex items-center justify-center', className)}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                {...props}
            >
                <motion.span
                    className='inline-flex'
                    animate={controls}
                    initial='normal'
                    variants={iconVariants}
                >
                    <MenuLucide size={size} strokeWidth={2} aria-hidden='true' />
                </motion.span>
            </motion.div>
        );
    },
);

MenuIcon.displayName = 'MenuIcon';
export { MenuIcon };
