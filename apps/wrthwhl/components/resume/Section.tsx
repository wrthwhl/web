'use client';

import { ReactNode } from 'react';
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  Contact as ContactIcon,
} from 'lucide-react';
import { Separator } from '../ui/Separator';
import { FadeIn } from '../ui/FadeIn';
import { cn } from '../../lib/utils';

const iconMap: Record<string, typeof Briefcase> = {
  briefcase: Briefcase,
  school: GraduationCap,
  lightbulb: Lightbulb,
  contact: ContactIcon,
};

export const Section = ({
  title,
  icon,
  children,
  noPrint,
  columns,
}: {
  title: string;
  icon?: string;
  children: ReactNode;
  noPrint?: boolean;
  columns?: number;
}) => {
  const Icon = icon ? iconMap[icon] : null;

  return (
    <FadeIn
      className={cn(noPrint && 'print:hidden', 'print-avoid-break-after')}
    >
      <Separator
        label={
          <>
            {Icon && <Icon size={14} />}
            <span>{title}</span>
          </>
        }
        labelPosition="center"
      />
      {columns ? (
        <div
          className="my-phi-xl mx-phi flex flex-row justify-evenly print-avoid-break"
          style={{ columns }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </FadeIn>
  );
};
