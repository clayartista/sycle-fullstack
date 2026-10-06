"use client";

import { useNavigate } from '@/lib/navigation';
import Button from '@/components/ui/Button';
import { landingContent } from '@/config/landing';

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-rose to-rose-dark rounded-2xl p-6 shadow-lg mb-4">
      <p className="text-[11px] font-700 uppercase tracking-[0.15em] text-white/60 mb-2">{landingContent.eyebrow}</p>
      <h1 className="font-700 text-xl lg:text-2xl text-white mb-2 leading-tight">{landingContent.title}</h1>
      <p className="text-sm text-white/80 mb-5 leading-relaxed max-w-xl">{landingContent.description}</p>
      <Button
        variant="secondary"
        onClick={() => navigate('/personalisasi')}
        className="w-full min-h-14 border-0 text-rose shadow-sm hover:bg-blush"
      >
        {landingContent.primaryCta}
      </Button>
      <button
        onClick={() => navigate('/pelajari')}
        className="w-full mt-3 text-white/80 font-600 text-sm py-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg"
      >
        {landingContent.secondaryCta}
      </button>
    </section>
  );
}
