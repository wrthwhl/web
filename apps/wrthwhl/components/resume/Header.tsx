'use client';

import type { QRCodeData } from '../../lib/qrcode';
import { AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { QRCode } from '../ui/QRCode';
import { useResume } from './Context';
import { useScrollProgress } from '../../lib/useScrollProgress';
import { cn } from '../../lib/utils';

// Constants
const SCROLL_THRESHOLD = 80;
const AVATAR_SIZE = 80;
const AVATAR_MIN_SCALE = 0.618;

export const Header = ({ qrCode }: { qrCode?: QRCodeData }) => {
  const resume = useResume();
  const progress = useScrollProgress(SCROLL_THRESHOLD);

  if (!resume) return null;

  const avatarSize = AVATAR_SIZE * (1 - progress * (1 - AVATAR_MIN_SCALE));

  return (
    <div
      className={cn(
        'sticky top-0 z-50 px-4 print:static',
        progress > 0.2 && 'shadow-md',
      )}
      style={
        {
          // Set CSS custom property for scroll progress
          '--progress': progress,
          // Use color-mix for smooth background transition: page -> contrast
          backgroundColor: `color-mix(in srgb, var(--theme-bg-page), var(--theme-bg-contrast) calc(var(--progress) * 100%))`,
          paddingTop: `calc(1.618em - var(--progress) * 1em)`,
          paddingBottom: `calc(1.618em - var(--progress) * 1em)`,
          borderRadius: `0 0 3.182em 0.382em`,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {resume.avatar && (
            <div
              className="shrink-0 overflow-hidden rounded-phi"
              style={{ width: avatarSize, height: avatarSize }}
            >
              <AvatarImage
                src={resume.avatar}
                alt={resume.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col ml-phi">
            <h1
              className="font-heading font-bold text-accent small-caps"
              style={{
                fontSize: `calc(2.25rem - var(--progress) * 0.618rem)`,
                lineHeight: 1.1,
              }}
            >
              {resume.name}
            </h1>
            <div
              className="overflow-hidden"
              style={{
                // Fade faster: complete by 40% scroll (multiply by 2.5)
                opacity: `calc(1 - min(1, var(--progress) * 2.618))`,
                maxHeight: `calc(2.618em * (1 - var(--progress)))`,
              }}
            >
              {resume.nationality && (
                <span className="text-muted-xs block">
                  Nationality: {resume.nationality}
                </span>
              )}
              {resume.yob && (
                <span className="text-muted-xs block">YoB: {resume.yob}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="no-print shrink-0"
          >
            Print
          </Button>
          {qrCode && <QRCode data={qrCode} />}
        </div>
      </div>
    </div>
  );
};
