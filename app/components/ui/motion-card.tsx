'use client';

import { cn } from '@/app/lib/utils';
import React, { forwardRef, ReactNode } from "react";

interface MotionCardProps {
    className?: string;
    isSelected?: boolean;
    interactive?: boolean;
    variant?: 'primary' | 'secondary' | 'neutral' | 'white';
    children?: ReactNode;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(({
    className,
    isSelected = false,
    interactive = true,
    variant = 'white',
    children,
    onClick,
    ...props
}, ref) => {
    // Define variant classes using Tailwind
    const variantClasses = {
        primary: "bg-pink-500 text-white border-6 border-black",
        secondary: "bg-blue-500 text-white border-6 border-black",
        neutral: "bg-gray-3010 text-[#3A3A3A] border-6 border-black",
        white: cn(
            "bg-white text-[#3A3A3A] border-6",
            isSelected ? "border-white-500" : "border-black"
        ),
    };

    // Generate CSS classes based on state
    const stateClasses = cn(
        "transition-all duration-100 ease-out",
        isSelected ? "selected" : "",
        interactive && !isSelected ? "interactive" : "",
    );

    return (
        <div
            ref={ref}
            className={cn(
                // Base styles
                "font-sans rounded-[48px]",
                "motion-card",
                
                // Variant styles (can be overridden by className)
                variantClasses[variant],
                
                // State styles
                stateClasses,
                
                // Custom className (will override variant styles due to order)
                className
            )}
            onClick={interactive ? onClick : undefined}
            {...props}
        >
            {children}
        </div>
    );
});

MotionCard.displayName = "MotionCard";

export default MotionCard; 