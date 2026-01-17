'use client';

import { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';

export const SkillGroup = ({
  rating,
  children,
}: {
  rating: number;
  children: ReactNode;
}) => {
  return (
    <div className="max-w-[17.95em] mx-phi-xl text-center">
      <div
        className={cn(
          'flex justify-center',
          '[&>div]:relative [&>div]:w-[22px] [&>div]:h-[22px]',
          '[&_svg]:absolute [&_svg]:top-0 [&_svg]:left-0',
          '[&_svg:first-of-type]:text-[var(--color-accent)] [&_svg:first-of-type]:fill-transparent',
          '[&_svg:last-of-type]:text-[var(--color-accent-hover)] [&_svg:last-of-type]:fill-[var(--color-accent-hover)]',
          '[&_svg:last-of-type]:[clip-path:circle(0%_at_50%_50%)]',
          '[&_svg:last-of-type]:transition-[clip-path] [&_svg:last-of-type]:duration-300 [&_svg:last-of-type]:ease-in-out',
          '[&>div:hover_svg:last-of-type]:[clip-path:circle(75%_at_50%_50%)]',
          '[&>div:hover~div_svg:last-of-type]:[clip-path:circle(75%_at_50%_50%)]',
        )}
      >
        {[...Array(rating).keys()].map((i) => (
          <div key={i}>
            <Star size={22} />
            <Star size={22} />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};

export const SkillCategory = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <FadeIn className="mt-phi-md">
      <div className="text-muted-sm small-caps">{title}</div>
      <div className="text-body text-xs">{children}</div>
    </FadeIn>
  );
};
