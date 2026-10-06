import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  children: ReactNode;
}

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'inline-flex items-center justify-center min-h-10 rounded-xl px-3 py-2 text-sm font-600 text-sycle-muted hover:text-sycle-dark hover:bg-blush transition-colors',
    soft: 'inline-flex items-center justify-center min-h-10 rounded-xl px-3 py-2 text-sm font-600 bg-blush text-rose hover:bg-rose/10 transition-colors',
  } as const;

  return (
    <button className={`${styles[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
