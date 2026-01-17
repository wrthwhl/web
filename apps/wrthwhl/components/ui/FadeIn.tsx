'use client';

import { ReactNode } from 'react';
import { useInView } from '../../lib/useInView';
import { cn } from '../../lib/utils';

interface FadeInProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that fades in and slides up when scrolled into view.
 * Animation is disabled for print.
 */
export function FadeIn({ children, className }: FadeInProps) {
  const { ref, isVisible } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        'animate-fade-slide-up',
        isVisible && 'is-visible',
        className,
      )}
    >
      {children}
    </div>
  );
}
