"use client";

import { useNavigate } from '@/lib/navigation';
import { landingContent } from '@/config/landing';

export default function LandingQuickLinks() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {landingContent.actions.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.href)}
          className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm text-left hover:border-rose/30 hover:bg-blush/30 transition-all group focus:outline-none focus:ring-2 focus:ring-rose/50"
        >
          <div className="text-2xl mb-2" aria-hidden="true">{item.icon}</div>
          <p className="font-600 text-sm text-sycle-dark group-hover:text-rose transition-colors">{item.label}</p>
          <p className="text-xs text-sycle-muted mt-0.5">{item.description}</p>
        </button>
      ))}
    </div>
  );
}
