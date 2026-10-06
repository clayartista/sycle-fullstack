"use client";

import { useApp } from '@/context/AppContext';
import { InfoButton } from '@/components/InfoModal';
import { landingContent as landingCopy, landingMetricLabels } from '@/config/landing';

function Metric({ label, value, infoTerm }: { label: string; value: string; infoTerm: 'kelembapan' | 'kualitas-udara' | 'pm25' }) {
  return (
    <div className="bg-white/60 rounded-xl p-3 backdrop-blur-sm border border-white/50">
      <div className="flex items-center gap-0.5">
        <p className="text-xs text-sycle-muted font-500 leading-tight">{label}</p>
        <InfoButton term={infoTerm} />
      </div>
      <p className="text-sm font-700 text-sycle-dark mt-1">{value}</p>
    </div>
  );
}

export default function LandingEnvironmentCard() {
  const { envData, envSource } = useApp();

  return (
    <section className="bg-gradient-to-br from-rose/5 via-blush to-powder rounded-2xl p-5 mb-4 border border-rose/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-800 text-sycle-dark">{envData.temp}°C</span>
            <span className="text-lg font-500 text-sycle-muted">{envData.weather}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-sycle-muted">
            <span>Terasa seperti {envData.feelsLike}°C</span>
            <InfoButton term="terasa-seperti" />
          </div>
        </div>
        <div className="text-4xl" aria-hidden="true">☀️</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric label={landingMetricLabels.humidity} value={`${envData.humidity}%`} infoTerm="kelembapan" />
        <Metric label={landingMetricLabels.airQuality} value={envData.airQuality} infoTerm="kualitas-udara" />
        <Metric label={landingMetricLabels.pm25} value={`${envData.pm25} µg/m³`} infoTerm="pm25" />
      </div>

      <p className="mt-3 text-xs text-sycle-muted text-center">{envSource === 'live' ? `${envData.sourceLabel || 'Kondisi lingkungan live'} · ${envData.observedAt ? new Date(envData.observedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}` : landingCopy.sourceNote}</p>
    </section>
  );
}

