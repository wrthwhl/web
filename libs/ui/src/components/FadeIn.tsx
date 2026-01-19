'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
}

const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  ({ className, delay = 0, duration = 500, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('animate-fade-in', className)}
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
          ...style,
        }}
        {...props}
      />
    );
  },
);
FadeIn.displayName = 'FadeIn';

export { FadeIn };
