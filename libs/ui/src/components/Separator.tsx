'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../lib/utils';

export interface SeparatorProps extends React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
> {
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = 'horizontal',
      decorative = true,
      label,
      labelPosition = 'center',
      ...props
    },
    ref,
  ) => {
    if (label) {
      const justifyClass = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
      }[labelPosition];

      return (
        <div
          className={cn(
            'flex items-center gap-[var(--spacing-phi-sm)]',
            justifyClass,
            className,
          )}
        >
          {labelPosition !== 'start' && (
            <SeparatorPrimitive.Root
              ref={ref}
              decorative={decorative}
              orientation={orientation}
              className="shrink bg-[hsl(var(--border))] data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:flex-1 data-[orientation=vertical]:w-px"
              {...props}
            />
          )}
          <span className="text-xs text-[hsl(var(--muted-foreground))] px-[var(--spacing-phi-xs)]">
            {label}
          </span>
          {labelPosition !== 'end' && (
            <SeparatorPrimitive.Root
              decorative={decorative}
              orientation={orientation}
              className="shrink bg-[hsl(var(--border))] data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:flex-1 data-[orientation=vertical]:w-px"
            />
          )}
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-[hsl(var(--border))]',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
