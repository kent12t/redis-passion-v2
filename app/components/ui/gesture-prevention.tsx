'use client';

import React, { useEffect } from 'react';
import { useDebug } from '../../lib/debug-context';

export const GesturePrevention: React.FC = () => {
  const { debugState } = useDebug();

  useEffect(() => {
    const preventContextMenu = (e: Event) => {
      // Only prevent if debug mode is disabled
      if (!debugState.enableGestures) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add event listener to conditionally prevent context menu
    document.addEventListener('contextmenu', preventContextMenu, { passive: false });

    // Also update body class for CSS conditional styling
    if (debugState.enableGestures) {
      document.body.classList.add('gestures-enabled');
    } else {
      document.body.classList.remove('gestures-enabled');
    }

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [debugState.enableGestures]);

  return null; // This component doesn't render anything
};