import { useState, useEffect } from 'react';

/**
 * Hook to track scroll progress within a threshold range.
 * @param threshold - The scroll distance (in px) over which progress goes from 0 to 1
 * @returns progress value between 0 and 1
 */
export function useScrollProgress(threshold = 100): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const value = Math.min(1, Math.max(0, window.scrollY / threshold));
      setProgress(value);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return progress;
}
