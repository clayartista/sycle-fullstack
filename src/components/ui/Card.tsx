import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export default function Card({ children, className = '', as = 'div' }: CardProps) {
  const Component = as;
  return (
    <Component className={`rounded-2xl border border-sycle-border bg-white shadow-sm ${className}`.trim()}>
      {children}
    </Component>
  );
}
