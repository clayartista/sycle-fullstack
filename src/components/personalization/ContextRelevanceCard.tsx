"use client";

import type { PersonalizationData, EnvData } from '@/types';

export default function ContextRelevanceCard({ data, envData, live }: { data: PersonalizationData; envData: EnvData; live: boolean }) {
  const context = data.womenContext.filter((item) => item !== 'Saya tidak ingin menjawab');
  const outside = data.locationPref === 'Di luar ruangan' || data.outdoorDuration !== 'Tidak berada di luar';
  const reasons = [
    envData.temp >= 30 || envData.feelsLike >= 34 ? 'Panas dan aktivitas dapat menjadi konteks penting untuk pengalaman harianmu.' : null,
    envData.humidity >= 70 ? 'Kelembapan cukup tinggi, sehingga rasa panas bisa terasa lebih berat.' : null,
    envData.pm25 >= 25 ? 'Kualitas udara ikut dipertimbangkan saat aktivitas berada di luar.' : null,
    outside ? `Aktivitasmu: ${data.activity || 'di luar ruangan'}.` : null,
  ].filter(Boolean) as string[];

  const actions = [
    envData.temp >= 30 || envData.feelsLike >= 34 ? 'Cari tempat lebih sejuk dan beri jeda saat tubuh terasa tidak nyaman.' : 'Tetap perhatikan perubahan kondisi lingkungan sepanjang hari.',
    envData.humidity >= 70 ? 'Sediakan air minum dan pilih waktu/area yang lebih nyaman untuk aktivitas.' : null,
    envData.pm25 >= 25 && outside ? 'Periksa kualitas udara sebelum aktivitas luar berikutnya.' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-2xl border border-sage bg-sage/20 p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="chip chip-sage">Konteksmu siap</span>
        {context.map((item) => <span key={item} className="chip chip-blush">{item}</span>)}
        <span className="chip chip-powder">{live ? 'Lingkungan live' : 'Data demo'}</span>
      </div>
      <p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Mengapa ini relevan?</p>
      <ul className="space-y-1.5 text-sm text-sycle-dark">
        {(reasons.length ? reasons : ['SYCLE akan memakai konteksmu untuk memilih evidence yang paling relevan.']).map((reason) => (
          <li key={reason} className="flex gap-2"><span className="text-rose">•</span><span>{reason}</span></li>
        ))}
      </ul>
      <div className="mt-3 rounded-xl bg-white/70 border border-white px-3.5 py-3">
        <p className="text-[11px] font-700 uppercase tracking-wide text-sycle-muted mb-1">Yang bisa kamu lakukan</p>
        <ul className="space-y-1.5 text-sm text-sycle-dark">
          {actions.map((action) => <li key={action} className="flex gap-2"><span className="text-green-700">✓</span><span>{action}</span></li>)}
        </ul>
      </div>
    </div>
  );
}
