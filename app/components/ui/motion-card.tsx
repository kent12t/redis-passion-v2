'use client';

import { motion } from "framer-motion";
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

    // Define animation states
    const initialState = {
        boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
        x: 0,
        y: 0,
    };

    const hoverState = interactive ? {
        boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
        x: 2,
        y: 2,
    } : initialState;

    const tapState = interactive ? {
        boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
        x: 4,
        y: 4,
    } : initialState;

    // Selected state uses the tap state
    const selectedState = tapState;

    // Set initial state based on whether the card is selected
    const initialAnimation = isSelected ? selectedState : initialState;

    return (
        <motion.div
            ref={ref}
            className={cn(
                "rounded-lg font-sans",
                className
            )}
            style={cardVariants[variant]}
            initial={initialAnimation}
            whileHover={interactive ? (isSelected ? selectedState : hoverState) : initialState}
            whileTap={interactive ? tapState : initialState}
            animate={isSelected ? selectedState : initialState}
            transition={{
                type: "tween",
                duration: 0.1,
                ease: "easeOut"
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
});

MotionCard.displayName = "MotionCard";

export default MotionCard; 