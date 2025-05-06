'use client';

import { cn } from "../../lib/utils";
import { forwardRef, ReactNode } from "react";

interface MotionButtonProps {
    className?: string;
    variant?: "primary" | "secondary" | "neutral" | "destructive" | "outline" | "noShadow";
    size?: "default" | "sm" | "lg" | "icon";
    isSelected?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    onClick?: () => void;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(({
    className,
    variant = "primary",
    size = "default",
    isSelected = false,
    children,
    ...props
}, ref) => {
    // Define variants based on button type
    const buttonVariants = {
        primary: {
            background: "rgb(236, 72, 153)", // pink-500
            color: "white",
            border: "2px solid black",
        },
        secondary: {
            background: "rgb(59, 130, 246)", // blue-500
            color: "white",
            border: "2px solid black",
        },
        neutral: {
            background: "white",
            color: "black",
            border: "2px solid black",
        },
        destructive: {
            background: "rgb(239, 68, 68)", // red-500
            color: "white",
            border: "2px solid black",
        },
        outline: {
            background: "transparent",
            color: "black",
            border: "2px solid black",
        },
    };

    // Define sizes
    const buttonSizes = {
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
                "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium",
                "transition-colors gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                buttonSizes[size as keyof typeof buttonSizes],
                "motion-button",
                stateClasses,
                className
            )}
            style={buttonVariants[variant as keyof typeof buttonVariants]}
            {...props}
        >
            {children}
        </button>
    );
});

MotionButton.displayName = "MotionButton";

export default MotionButton; 