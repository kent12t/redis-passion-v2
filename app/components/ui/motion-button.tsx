'use client';

import { cn } from '@/app/lib/utils';
import { forwardRef, ReactNode } from "react";

interface MotionButtonProps {
    className?: string;
    variant?: "primary" | "secondary" | "neutral" | "destructive" | "outline" | "noShadow";
    size?: "default" | "sm" | "lg" | "icon";
    isSelected?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(({
    className,
    variant = "primary",
    size = "default",
    isSelected = false,
    children,
    ...props
}, ref) => {
    // Define variant classes using Tailwind
    const variantClasses = {
        primary: "bg-pink-500 text-white border-6 border-black",
        secondary: "bg-blue-500 text-white border-6 border-black",
        neutral: "bg-white text-black border-6 border-black",
        destructive: "bg-red-500 text-white border-6 border-black",
        outline: "bg-transparent text-black border-6 border-black",
        noShadow: "bg-white text-black border-6 border-black",
    };

    // Define sizes
    const sizeClasses = {
        default: "h-10 px-5 py-3 text-sm",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-11 px-8 py-4 text-lg",
        icon: "h-16 w-16 p-0",
    };

    // Generate CSS classes based on state
    const stateClasses = cn(
        "transition-all duration-100 ease-out",
        isSelected ? "selected" : "",
        !isSelected ? "interactive" : ""
    );

    return (
        <button
            ref={ref}
            className={cn(
                // Base styles
                "inline-flex items-center justify-center whitespace-nowrap rounded-full",
                "transition-colors gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "motion-button",
                
                // Variant styles (can be overridden by className)
                variantClasses[variant],
                
                // Size styles
                sizeClasses[size],
                
                // State styles
                stateClasses,
                
                // Custom className (will override variant styles due to order)
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});

MotionButton.displayName = "MotionButton";

export default MotionButton; 