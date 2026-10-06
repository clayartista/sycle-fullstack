"use client";
import type { EvidenceBadgeType } from '../types';
import { BADGE_LABELS, BADGE_COLORS } from '../types';

interface EvidenceBadgeProps {
  badge: EvidenceBadgeType;
  className?: string;
}

export default function EvidenceBadge({ badge, className = '' }: EvidenceBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-600 ${BADGE_COLORS[badge]} ${className}`}>
      {badge === 'kuat' && <span>●</span>}
      {badge === 'terbatas' && <span>◐</span>}
      {badge === 'berbeda' && <span>◑</span>}
      {badge === 'belum-cukup' && <span>○</span>}
      {BADGE_LABELS[badge]}
    </span>
  );
}
