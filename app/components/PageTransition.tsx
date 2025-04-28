'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    isVisible: boolean;
    direction?: 'left' | 'right';
    animationKey: string | number;
}

export const PageTransition = ({
    children,
    isVisible,
    direction = 'right',
    animationKey,
}: PageTransitionProps) => {
    // Direction multiplier: negative for left, positive for right
    const directionMultiplier = direction === 'left' ? -1 : 1;

    const variants = {
        initial: {
            x: 100 * directionMultiplier,
            opacity: 0,
        },
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        },
        exit: {
            x: -100 * directionMultiplier,
            opacity: 0,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key={animationKey}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants}
                    className="w-full h-full absolute"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageTransition; 