import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-700 uppercase tracking-[0.15em] text-rose mb-1">{eyebrow}</p> : null}
        <h2 className="text-xl sm:text-2xl font-700 text-sycle-dark leading-tight">{title}</h2>
        {description ? <p className="text-sm text-sycle-muted mt-1 leading-relaxed max-w-2xl">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
