'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface GoldenPageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main content area (larger golden ratio section) */
  children: React.ReactNode;
  /** Sidebar content (smaller golden ratio section) */
  sidebar?: React.ReactNode;
  /** Reverse layout - sidebar on left */
  reverse?: boolean;
}

/**
 * A layout component that divides space using the golden ratio (1.618:1)
 * Main content gets ~61.8% of space, sidebar gets ~38.2%
 */
const GoldenPageLayout = React.forwardRef<
  HTMLDivElement,
  GoldenPageLayoutProps
>(({ className, children, sidebar, reverse = false, ...props }, ref) => {
  if (!sidebar) {
    return (
      <div
        ref={ref}
        className={cn('w-full max-w-4xl mx-auto', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex gap-[var(--spacing-phi-lg)]',
        reverse && 'flex-row-reverse',
        className,
      )}
      {...props}
    >
      {/* Main content: 61.8% */}
      <div className="flex-[1.618] min-w-0">{children}</div>
      {/* Sidebar: 38.2% */}
      <div className="flex-1 min-w-0">{sidebar}</div>
    </div>
  );
});
GoldenPageLayout.displayName = 'GoldenPageLayout';

export { GoldenPageLayout };
