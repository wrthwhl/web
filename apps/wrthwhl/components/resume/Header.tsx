'use client';

import { ReactNode } from 'react';
import { AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useResume } from './Context';
import { useScrollProgress } from '../../lib/useScrollProgress';
import { cn } from '../../lib/utils';

// Constants
const SCROLL_THRESHOLD = 80;
const AVATAR_SIZE = 80;
const AVATAR_MIN_SCALE = 0.6;

export const Header = ({ children }: { children?: ReactNode }) => {
  const resume = useResume();
  const progress = useScrollProgress(SCROLL_THRESHOLD);

  if (!resume) return null;

  const avatarSize = AVATAR_SIZE * (1 - progress * (1 - AVATAR_MIN_SCALE));

  return (
    <div
      className={cn('sticky top-0 z-50 px-4', progress > 0.2 && 'shadow-md')}
      style={
        {
          // Set CSS custom property for scroll progress
          '--progress': progress,
          // Use color-mix for smooth background transition: dark-8 -> dark-9
          backgroundColor: `color-mix(in srgb, var(--color-dark-8), var(--color-dark-9) calc(var(--progress) * 100%))`,
          paddingTop: `calc(1.618em - var(--progress) * 1em)`,
          paddingBottom: `calc(1em - var(--progress) * 0.5em)`,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {resume.avatar && (
            <div
              className="shrink-0 overflow-hidden rounded-[0.618em]"
              style={{ width: avatarSize, height: avatarSize }}
            >
              <AvatarImage
                src={resume.avatar}
                alt={resume.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col ml-[1em]">
            <h1
              className="font-heading font-bold text-teal-5 cursor-default hover:text-teal-3 transition-colors"
              style={{
                fontVariant: 'all-small-caps',
                fontSize: `calc(2.25rem - var(--progress) * 0.5rem)`,
                lineHeight: 1.1,
              }}
            >
              {resume.name}
            </h1>
            <div
              className="overflow-hidden"
              style={{
                // Fade faster: complete by 40% scroll (multiply by 2.5)
                opacity: `calc(1 - min(1, var(--progress) * 2.5))`,
                maxHeight: `calc(2.5em * (1 - var(--progress)))`,
              }}
            >
              {resume.nationality && (
                <span className="text-xs text-gray-6 block">
                  Nationality: {resume.nationality}
                </span>
              )}
              {resume.yob && (
                <span className="text-xs text-gray-6 block">
                  YoB: {resume.yob}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="no-print shrink-0"
        >
          Print
        </Button>
      </div>
    </div>
  );
};
