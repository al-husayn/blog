import type { HTMLMotionProps } from 'motion/react';

export interface MenuIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

export interface MenuIconProps extends HTMLMotionProps<'div'> {
    size?: number;
}
