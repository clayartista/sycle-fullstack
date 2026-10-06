"use client";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8',
  md: 'h-11',
  lg: 'h-16',
} as const;

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <img
      src="/sycle-logo.png"
      alt="SYCLE"
      className={`${sizes[size]} w-auto object-contain ${className}`.trim()}
    />
  );
}
