'use client';

import React, { useState, useRef } from 'react';
import { useDebug } from '../../lib/debug-context';

export const DebugButton: React.FC = () => {
  const { debugState, enableDebugMode, disableDebugMode } = useDebug();
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // If this is the third tap within the window, enable debug mode
    if (newTapCount >= 3) {
      if (debugState.isDebugMode) {
        disableDebugMode();
      } else {
        enableDebugMode();
      }
      setTapCount(0);
      return;
    }

    // Reset tap count after 1 second
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 1000);
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`
        fixed bottom-4 right-4 w-[50px] h-[50px] z-50 cursor-pointer
        ${debugState.isDebugMode 
          ? 'bg-green-500 opacity-70 border-2 border-green-600' 
          : 'bg-transparent opacity-0 hover:opacity-10 hover:bg-red-200'
        }
        transition-all duration-200
      `}
      onClick={handleTap}
      onTouchEnd={handleTap}
      title={debugState.isDebugMode ? 'Debug Mode Active - Tap 3x to disable' : 'Debug Button - Tap 3x quickly to enable'}
    >
      {debugState.isDebugMode && (
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
          DEBUG
        </div>
      )}
    </div>
  );
};