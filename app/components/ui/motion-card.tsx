'use client';

import { cn } from "../../lib/utils";
import { forwardRef, ReactNode } from "react";

interface MotionCardProps {
    className?: string;
    isSelected?: boolean;
    interactive?: boolean;
    variant?: 'primary' | 'secondary' | 'neutral' | 'white';
    textColor?: string;
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
    textColor = "#3A3A3A",
    onClick,
    style,
    ...props
}, ref) => {
    // Define variants based on card type
    const cardVariants = {
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
            background: "rgb(209, 213, 219)", // gray-300
            color: textColor,
            border: "2px solid black",
        },
        white: {
            background: "white",
            color: textColor,
            border: isSelected ? "2px solid rgb(236, 72, 153)" : "2px solid black", // Pink border if selected
        },
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
                "rounded-lg font-sans",
                "motion-card",
                stateClasses,
                className
            )}
            style={{
                ...cardVariants[variant],
                ...style,
            }}
            onClick={interactive ? onClick : undefined}
            {...props}
        >
            {children}
        </div>
    );
});

MotionCard.displayName = "MotionCard";

export default MotionCard; 