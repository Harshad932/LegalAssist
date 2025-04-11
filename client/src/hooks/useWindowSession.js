// src/hooks/useWindowSession.js
import { useEffect } from 'react';

export const useWindowSession = () => {
  useEffect(() => {
    if (!window.name) {
      window.name = `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const handleBeforeUnload = () => {
      // Optional: Clean up session data when window closes
      // import { clearWindowData } from '../utils/storage';
      // clearWindowData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};