'use client';

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';

export interface TimelineItemProps {
  title: string;
  org: string;
  start: string;
  end?: string;
  children: ReactNode;
}

const TimelineItem = ({
  title,
  org,
  start,
  end,
  children,
}: TimelineItemProps) => {
  return (
    <FadeIn className="flex flex-row mx-phi-sm my-phi-lg print-avoid-break">
      <div className="mr-phi-lg font-mono">
        <div className="h-full flex flex-col justify-between text-center">
          <span className="text-tertiary">{end || 'Now'}</span>
          <div className="w-1/2 h-full border-r border-muted" />
          <span className="text-tertiary">{start}</span>
        </div>
      </div>
      <div>
        <div>
          <span className="text-sm font-bold text-accent">{title}</span>{' '}
          <span className="text-muted-sm">@ {org}</span>
        </div>
        <div
          className={cn(
            'text-sm leading-snug text-description mb-phi-xs',
            '[&_ul]:pl-4 [&_ul]:mt-phi-md [&_ul]:list-disc',
          )}
        >
          {children}
        </div>
      </div>
    </FadeIn>
  );
};

export interface TimelineProps {
  children: ReactNode;
}

export const Timeline = ({ children }: TimelineProps) => {
  return <div className="print-avoid-break-before">{children}</div>;
};

Timeline.Item = TimelineItem;
