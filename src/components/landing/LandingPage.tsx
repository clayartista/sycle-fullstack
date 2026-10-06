"use client";

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import LandingLocationBar from '@/components/landing/LandingLocationBar';
import LandingEnvironmentCard from '@/components/landing/LandingEnvironmentCard';
import LandingHero from '@/components/landing/LandingHero';
import LandingQuickLinks from '@/components/landing/LandingQuickLinks';
import LandingAccountPrompt from '@/components/landing/LandingAccountPrompt';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const { envData } = useApp();
  const [dataUnavailable] = useState(false);

  if (dataUnavailable) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">🌐</div>
        <h2 className="font-700 text-lg text-sycle-dark mb-2">Data lingkungan belum tersedia untuk lokasi ini.</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button variant="secondary">Coba Lagi</Button>
          <Button variant="secondary">Pilih Lokasi Lain</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
      {/* EDIT LANDING: all visible sections are composed here. */}
      <div className="mb-5 lg:hidden">
        <p className="text-xs font-700 uppercase tracking-[0.15em] text-rose">Kondisi di sekitarmu</p>
        <p className="text-sm text-sycle-muted mt-1">{envData.weather}, {envData.temp}°C</p>
      </div>

      <div className="lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:items-start">
        <div>
          <LandingLocationBar />
          <LandingEnvironmentCard />
        </div>

        <div className="mt-6 lg:mt-0">
          <LandingHero />
          <LandingQuickLinks />
          <LandingAccountPrompt />
        </div>
      </div>
    </div>
  );
}
