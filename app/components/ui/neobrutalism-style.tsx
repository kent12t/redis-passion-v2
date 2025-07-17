'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import { useNeoBrutalism } from './neobrutalism-provider';

interface NeoBrutalStyleProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    interactive?: boolean;
    rounded?: 'default' | 'full' | 'none';
    shadow?: boolean;
    as?: React.ElementType;
}

export const NeoBrutalStyle: React.FC<NeoBrutalStyleProps> = ({
    children,
    className,
    interactive = true,
    rounded = 'default',
    shadow = true,
    as: Component = 'div',
    ...props
}) => {
    const { borderWidth, borderColor, shadowOffset, shadowColor, cornerRadius } = useNeoBrutalism();

    const getRounded = () => {
        if (rounded === 'full') return 'rounded-full';
        if (rounded === 'none') return 'rounded-none';
        return cornerRadius;
    };

    return (
        <Component
            className={cn(
                // Base styles
                `border-${borderWidth} border-${borderColor} bg-white`,
                getRounded(),

                // Shadow
                shadow && `shadow-[${shadowOffset}_${shadowOffset}_0px_0px_${shadowColor}]`,

                // Interactive styles
                interactive && 'transition-all',
                interactive && `hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_${shadowColor}]`,
                interactive && `active:translate-x-[${shadowOffset}] active:translate-y-[${shadowOffset}] active:shadow-none`,

                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
};

export default NeoBrutalStyle; 