'use client';

import React, { createContext, useContext } from 'react';

interface NeoBrutalismContextProps {
    borderWidth: string;
    borderColor: string;
    shadowOffset: string;
    shadowColor: string;
    cornerRadius: string;
    hoverOffset: string;
    activeOffset: string;
}

// Default neobrutalism styling configuration
const defaultNeoBrutalismConfig: NeoBrutalismContextProps = {
    borderWidth: '12px',
    borderColor: 'black',
    shadowOffset: '-36px',
    shadowColor: 'rgba(0,0,0,1)',
    cornerRadius: 'rounded-lg',
    hoverOffset: '-1px',
    activeOffset: '-36px',
};

const NeoBrutalismContext = createContext<NeoBrutalismContextProps>(defaultNeoBrutalismConfig);

export const useNeoBrutalism = () => useContext(NeoBrutalismContext);

interface NeoBrutalismProviderProps {
    children: React.ReactNode;
    config?: Partial<NeoBrutalismContextProps>;
}

export const NeoBrutalismProvider: React.FC<NeoBrutalismProviderProps> = ({
    children,
    config = {},
}) => {
    const mergedConfig = { ...defaultNeoBrutalismConfig, ...config };

    return (
        <NeoBrutalismContext.Provider value={mergedConfig}>
            {children}
        </NeoBrutalismContext.Provider>
    );
};

// Helper to create neobrutalism shadow style
export const createShadowStyle = (offset: string, color: string) => {
    return `${offset} ${offset.replace('-', '')} 0px 0px ${color}`;
};

// Custom hook to get hover styles
export const useNeoBrutalismHover = () => {
    const { hoverOffset, activeOffset } = useNeoBrutalism();

    return {
        hoverStyles: `hover:translate-x-[${hoverOffset}] hover:translate-y-[${hoverOffset.replace('-', '')}] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]`,
        activeStyles: `active:translate-x-[${activeOffset}] active:translate-y-[${activeOffset.replace('-', '')}] active:shadow-none`,
    };
};

export default NeoBrutalismProvider; 