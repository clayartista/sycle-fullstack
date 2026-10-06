import type { ReactNode } from 'react';

interface IconBadgeProps {
  children: ReactNode;
  tone?: 'rose' | 'sage' | 'lavender' | 'powder';
  className?: string;
}

export default function IconBadge({ children, tone = 'rose', className = '' }: IconBadgeProps) {
  const tones = {
    rose: 'bg-rose/10 text-rose',
    sage: 'bg-sage text-green-800',
    lavender: 'bg-lavender text-sycle-dark',
    powder: 'bg-powder text-sycle-dark',
  } as const;

  return (
    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]} ${className}`.trim()}>
      {children}
    </span>
  );
}
