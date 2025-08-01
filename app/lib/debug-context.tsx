'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DebugState } from './types';

interface DebugContextType {
  debugState: DebugState;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

interface DebugProviderProps {
  children: ReactNode;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  const [debugState, setDebugState] = useState<DebugState>({
    isDebugMode: false,
    enableGestures: false,
  });

  const enableDebugMode = () => {
    setDebugState({
      isDebugMode: true,
      enableGestures: true,
    });
  };

  const disableDebugMode = () => {
    setDebugState({
      isDebugMode: false,
      enableGestures: false,
    });
  };

  return (
    <DebugContext.Provider value={{ debugState, enableDebugMode, disableDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
};