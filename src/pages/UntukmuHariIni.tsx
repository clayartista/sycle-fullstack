"use client";

import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import EvidenceBadge from '../components/EvidenceBadge';
import LocationPermissionCard from '../components/location/LocationPermissionCard';
import type { EvidenceTopic } from '../types';
import { SCALE_LABELS } from '../types';

const ENV_ACTIONS = [
  { icon: '💧', text: 'Minum secara teratur dan simpan air minum agar mudah dijangkau.' },
  { icon: '🌤', text: 'Pilih tempat yang lebih sejuk atau teduh saat aktivitas di luar.' },
  { icon: '⏱', text: 'Beri jeda istirahat saat tubuh terasa tidak nyaman.' },
  { icon: '😷', text: 'Perhatikan kualitas udara sebelum aktivitas di luar.' },
];

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/70 border border-white/80 p-3"><p className="text-[11px] text-sycle-muted">{label}</p><p className="text-sm font-700 text-sycle-dark mt-0.5">{value}</p></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-2 border-b border-sycle-border last:border-0"><span className="text-xs text-sycle-muted font-600">{label}</span><span className="text-sm text-sycle-dark font-600 text-right">{value || '—'}</span></div>;
}

function WhyModal({ topic, onClose }: { topic: EvidenceTopic; onClose: () => void }) {
  const { personalization, envData } = useApp();
  const reasons = [
    `${envData.temp}°C dan terasa seperti ${envData.feelsLike}°C`,
    `Kelembapan ${envData.humidity}%`,
    `PM2.5 ${envData.pm25}`,
    personalization?.activity ? `Aktivitas: ${personalization.activity}` : null,
    personalization?.outdoorDuration ? `Durasi di luar: ${personalization.outdoorDuration}` : null,
  ].filter(Boolean) as string[];

  return <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-sycle-dark/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-auto p-6 shadow-2xl">
      <div className="w-10 h-1 bg-sycle-border rounded-full mx-auto mb-5 sm:hidden" />
      <div className="flex items-start justify-between gap-4 mb-4"><div><p className="text-xs font-700 uppercase tracking-wider text-sycle-muted mb-1">Kenapa ini muncul?</p><h3 className="font-700 text-lg text-sycle-dark">{topic.title}</h3></div><button onClick={onClose} className="w-10 h-10 rounded-full bg-sycle-bg text-sycle-muted hover:text-sycle-dark" aria-label="Tutup">×</button></div>
      <div className="grid gap-2 mb-4">{reasons.map((reason) => <div key={reason} className="flex items-center gap-3 bg-sycle-bg rounded-xl px-3 py-2.5"><span className="w-6 h-6 rounded-full bg-sage text-green-800 flex items-center justify-center text-xs font-700">✓</span><span className="text-sm text-sycle-dark">{reason}</span></div>)}</div>
      {topic.whyRelevant && <p className="text-sm text-sycle-dark leading-relaxed bg-powder/50 rounded-xl p-3 mb-3">{topic.whyRelevant}</p>}
      <p className="text-xs text-sycle-muted leading-relaxed">Relevansi memilih evidence berdasarkan konteks yang kamu berikan. Ini bukan penilaian risiko pribadi atau diagnosis.</p>
    </div>
  </div>;
}

export default function UntukmuHariIni() {
  const navigate = useNavigate();
  const {
    sessionTopics,
    personalization,
    reflection,
    envData,
    envSource,
    envUpdatedAt,
    location,
    isLoggedIn,
    journalEntries,
    saveToJournal,
    showToast,
    setCurrentEvidenceTopic,
    evidenceLoading,
    evidenceError,
  } = useApp();
  const [whyTopic, setWhyTopic] = useState<EvidenceTopic | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  if (!personalization) {
    navigate('/');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const existingTodayEntry = journalEntries.find((entry) => entry.date === today);
  const visibleContext = personalization.womenContext.filter((context) => context !== 'Saya tidak ingin menjawab');
  const ratedSymptoms: Array<[string, number]> = reflection
    ? (Object.entries(reflection.symptomScales) as Array<[string, number]>).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1])
    : [];
  const topSymptom = ratedSymptoms[0];
  const summaryLabel = !reflection ? 'Belum ada catatan tubuh hari ini' : !topSymptom ? 'Tidak ada keluhan yang dicatat' : `${topSymptom[0]} · ${SCALE_LABELS[topSymptom[1]]}`;
  const knowledgeActions = sessionTopics.flatMap((topic) => topic.actionSuggestions || []).slice(0, 4);
  const actions = (knowledgeActions.length ? knowledgeActions.map((text) => ({ icon: '✓', text })) : ENV_ACTIONS).slice(0, 4);

  const handleLearn = (topic: EvidenceTopic) => {
    setCurrentEvidenceTopic(topic);
    navigate(`/evidence/${topic.id}`);
  };

  const handleSave = () => {
    if (!isLoggedIn) { navigate('/manfaat-akun'); return; }
    const id = saveToJournal();
    setSavedEntryId(id);
    showToast(existingTodayEntry ? 'Ringkasan hari ini diperbarui ✓' : 'Ringkasan tersimpan di Health Tracker ✓');
  };

  return <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
    <div className="mb-5">
      <p className="text-xs font-700 uppercase tracking-[0.15em] text-rose mb-1">Untukmu hari ini</p>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3"><div><h1 className="font-800 text-2xl lg:text-3xl text-sycle-dark">Pahami, catat, lalu lihat ringkasannya.</h1><p className="text-sm text-sycle-muted mt-1">Semua konteks utama ada di satu halaman agar manfaat SYCLE terasa lebih cepat.</p></div><span className="chip chip-sage">AI + curated evidence</span></div>
    </div>

    {envSource !== 'live' && <div className="mb-4"><LocationPermissionCard /></div>}

    <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] mb-5">
      <div className="bg-gradient-to-br from-blush via-white to-powder rounded-3xl border border-rose/10 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Kondisi lingkungan</p><p className="text-xs text-sycle-muted mt-1">{location}</p></div><span className="chip chip-sage">{envSource === 'live' ? 'Live' : 'Demo'}</span></div>
        <div className="flex items-baseline gap-2 mb-4"><span className="text-5xl font-800 text-sycle-dark">{envData.temp}°</span><span className="text-sm font-600 text-sycle-muted">{envData.weather}</span></div>
        <p className="text-xs text-sycle-muted mb-3">Terasa seperti {envData.feelsLike}°C</p>
        <div className="grid grid-cols-3 gap-2"><Metric label="Kelembapan" value={`${envData.humidity}%`} /><Metric label="Udara" value={envData.airQuality} /><Metric label="PM2.5" value={`${envData.pm25}`} /></div>
        <p className="mt-3 text-[11px] text-sycle-muted text-center">{envData.sourceLabel || 'Data demo'}{envUpdatedAt ? ` · ${new Date(envUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
      </div>
      <div className="bg-white rounded-3xl border border-sycle-border p-5 shadow-sm">
        <p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Konteksmu</p>
        <h2 className="font-700 text-lg text-sycle-dark mt-1 mb-3">Inilah yang dipakai SYCLE untuk memilih evidence.</h2>
        <div className="flex flex-wrap gap-2 mb-3"><span className="chip chip-lavender">{personalization.ageRange}</span>{visibleContext.map((context) => <span key={context} className="chip chip-blush">{context}</span>)}{personalization.activity && <span className="chip chip-sage">{personalization.activity}</span>}</div>
        <Row label="Lokasi aktivitas" value={personalization.locationPref} /><Row label="Durasi di luar" value={personalization.outdoorDuration} /><Row label="Status lokasi" value={envSource === 'live' ? 'Izin lokasi aktif' : 'Belum memakai lokasi live'} />
        <p className="mt-3 text-xs text-sycle-muted leading-relaxed">Data lingkungan digunakan sebagai konteks, bukan untuk menetapkan diagnosis atau risiko pribadi.</p>
      </div>
    </section>

    <section className="mb-5">
      <div className="flex items-center justify-between gap-3 mb-3"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">PAHAMI</p><h2 className="font-700 text-lg text-sycle-dark">Evidence yang dipilih dari Knowledge Base</h2></div><span className="chip chip-powder">Retrieval kontekstual</span></div>
      {evidenceLoading ? <div className="bg-white rounded-3xl border border-sycle-border p-6 text-sm text-sycle-muted">Mencari evidence terkurasi yang paling sesuai dengan konteks dan kondisi lingkunganmu…</div> : sessionTopics.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sessionTopics.map((topic) => <article key={topic.id} className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm hover:shadow-md hover:border-rose/20 transition-all"><EvidenceBadge badge={topic.badge} className="mb-3" /><div className="flex items-start justify-between gap-2"><h3 className="font-700 text-base text-sycle-dark mb-1">{topic.title}</h3>{topic.hasEvidence ? <span className="chip chip-sage text-[10px]">{topic.sourceCount || 0} sumber</span> : <span className="chip chip-powder text-[10px]">Belum ada sumber</span>}</div><p className="text-xs text-sycle-muted leading-relaxed mb-3">{topic.claimSummary || topic.whyRelevant || 'Evidence akan dijelaskan dari sumber yang telah dipublikasikan.'}</p><div className="flex gap-2"><button disabled={!topic.hasEvidence} onClick={() => handleLearn(topic)} className="flex-1 bg-rose text-white rounded-xl py-2.5 text-sm font-600 disabled:opacity-40">Pelajari</button><button onClick={() => setWhyTopic(topic)} className="px-3 py-2.5 border border-sycle-border text-sycle-muted rounded-xl text-xs font-600 hover:bg-blush">Kenapa?</button></div></article>)}</div> : <div className="bg-white rounded-3xl border border-sycle-border p-5"><p className="text-sm font-700 text-sycle-dark">Evidence belum tersedia untuk konteks ini.</p><p className="text-xs text-sycle-muted mt-1">{evidenceError || 'Knowledge Base perlu memiliki sumber yang sudah diverifikasi dan dipublikasikan.'}</p></div>}
    </section>

    <section className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="bg-white rounded-3xl border border-sycle-border p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">CATAT TUBUH</p><h2 className="font-700 text-lg text-sycle-dark">Apa yang kamu rasakan?</h2></div>{!reflection && <span className="chip chip-powder">Opsional</span>}</div>
        {reflection ? <div className="space-y-3">{ratedSymptoms.length ? ratedSymptoms.slice(0, 4).map(([symptom, value]) => <div key={symptom} className="flex items-center justify-between gap-3 rounded-2xl bg-sycle-bg p-3"><span className="text-sm text-sycle-dark font-600">{symptom}</span><span className="text-xs text-sycle-muted font-600">{value}/4 · {SCALE_LABELS[value]}</span></div>) : <p className="text-sm text-sycle-muted">Tidak ada keluhan yang dicatat.</p>}{reflection.story && <p className="rounded-2xl bg-powder/40 p-3 text-sm text-sycle-dark leading-relaxed">“{reflection.aiStory || reflection.story}”</p>}<p className="text-xs text-sycle-muted">Catatanmu tidak diinterpretasikan oleh SYCLE.</p></div> : <div className="rounded-2xl bg-sage/40 border border-sage p-4"><p className="text-sm text-sycle-dark">Catatan tubuh membantu melihat kondisi dari waktu ke waktu.</p><button onClick={() => navigate('/refleksi')} className="mt-3 bg-rose text-white rounded-xl px-4 py-2.5 text-sm font-600 hover:bg-rose-dark">Ceritakan kondisimu</button></div>}
      </div>
      <div className="bg-sycle-bg rounded-3xl border border-sycle-border p-5"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Konteks hari ini</p><h2 className="font-700 text-lg text-sycle-dark mb-2">Semua input tetap terlihat sebelum ringkasan.</h2><Row label="Aktivitas" value={personalization.activity} /><Row label="Lingkungan" value={`${envData.temp}°C · ${envData.humidity}%`} /><Row label="Air quality" value={envData.airQuality} /></div>
    </section>

    <section className="mb-5">
      <div className="flex items-center justify-between gap-3 mb-3"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">RINGKASAN + AKSI</p><h2 className="font-700 text-lg text-sycle-dark">Ringkasan Hari Ini dan Yang Bisa Kamu Lakukan</h2></div><span className="chip chip-sage">Satu halaman</span></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="bg-white rounded-3xl border border-sycle-border p-5 shadow-sm"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-3">Ringkasan Hari Ini</p><div className="flex flex-wrap gap-2 mb-3"><span className="chip chip-lavender">{personalization.ageRange}</span>{visibleContext.map((context) => <span key={context} className="chip chip-blush">{context}</span>)}<span className="chip chip-sage">{personalization.activity}</span></div><Row label="Lokasi" value={location} /><Row label="Kondisi lingkungan" value={`${envData.temp}°C · ${envData.weather}`} /><Row label="Catatan tubuh" value={summaryLabel} /><p className="mt-3 text-xs text-sycle-muted leading-relaxed">Ringkasan ini membantu kamu melihat konteks hari ini dari waktu ke waktu. Bukan diagnosis.</p></div>
        <div className="bg-sycle-dark rounded-3xl p-5 text-white shadow-sm"><p className="text-xs font-700 uppercase tracking-wide text-white/60 mb-1">Yang Bisa Kamu Lakukan</p><h3 className="font-700 text-lg mb-4">Mulai dari langkah yang paling relevan untuk konteksmu.</h3><div className="space-y-3">{actions.map((action) => <div key={action.text} className="flex items-start gap-3 rounded-2xl bg-white/8 border border-white/10 p-3"><span className="text-xl" aria-hidden>{action.icon}</span><p className="text-sm text-white/90 leading-relaxed">{action.text}</p></div>)}</div><p className="text-xs text-white/55 mt-4">Edukasi dan pencegahan, bukan pengobatan.</p></div>
      </div>
    </section>

    <section className="bg-white rounded-3xl border border-sycle-border p-5 shadow-sm mb-5"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">SIMPAN & KEMBALI</p><h2 className="font-700 text-lg text-sycle-dark mb-2">Jadikan ini bagian dari Health Tracker.</h2><p className="text-sm text-sycle-muted leading-relaxed mb-4">Simpan hari ini untuk melihat perubahan dari waktu ke waktu dan mendukung percakapan dengan tenaga kesehatan.</p>{savedEntryId ? <><div className="rounded-xl bg-sage text-green-800 px-4 py-3 text-sm font-700 mb-2">Tersimpan di Health Tracker ✓</div><button onClick={() => navigate(`/tracker/${savedEntryId}`)} className="w-full border border-sycle-border rounded-xl py-3 text-sm font-600 text-sycle-dark hover:bg-blush">Lihat catatan</button></> : <button onClick={handleSave} className="w-full bg-rose text-white rounded-xl py-3.5 text-sm font-600 hover:bg-rose-dark">{existingTodayEntry ? 'Perbarui ringkasan hari ini' : 'Simpan ke Health Tracker'}</button>}</section>

    <div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={() => navigate('/pelajari')} className="bg-lavender/70 border border-lavender rounded-2xl p-4 text-left hover:bg-lavender"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Opsional</p><p className="font-700 text-sm text-sycle-dark mt-1">Pelajari lebih lanjut</p><p className="text-xs text-sycle-muted mt-1">Masuk ke pustaka pembelajaran tanpa mengubah core flow.</p></button><button onClick={() => navigate('/healthcare')} className="bg-sage/60 border border-sage rounded-2xl p-4 text-left hover:bg-sage"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Opsional</p><p className="font-700 text-sm text-sycle-dark mt-1">Healthcare</p><p className="text-xs text-sycle-muted mt-1">Cari fasilitas kesehatan ketika kamu membutuhkannya.</p></button></div>

    {whyTopic && <WhyModal topic={whyTopic} onClose={() => setWhyTopic(null)} />}
  </div>;
}
