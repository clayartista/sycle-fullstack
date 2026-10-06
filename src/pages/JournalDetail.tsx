"use client";
import { useState } from 'react';
import { useNavigate, useParams } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import EvidenceBadge from '../components/EvidenceBadge';
import { SCALE_LABELS } from '../types';

export default function JournalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { journalEntries, deleteJournalEntry, showToast } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pdfState, setPdfState] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');

  const entry = journalEntries.find(e => e.id === id);

  if (!entry) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">📭</div>
        <h2 className="font-700 text-lg text-sycle-dark mb-2">Catatan tidak ditemukan.</h2>
        <button onClick={() => navigate('/tracker')} className="text-rose font-600 hover:underline focus:outline-none">Kembali ke Health Tracker →</button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteJournalEntry(entry.id);
    showToast('Catatan dihapus.');
    navigate('/tracker');
  };

  const handlePDF = () => {
    setPdfState('generating');
    setTimeout(() => {
      if (Math.random() > 0.1) setPdfState('done');
      else setPdfState('error');
    }, 1800);
  };

  const dateLabel = new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const ratedSymptoms = entry.reflection ? Object.entries(entry.reflection.symptomScales).filter(([, v]) => v > 0) : [];
  const visibleContext = entry.personalization.womenContext.filter(c => c !== 'Saya tidak ingin menjawab');

  const phaseRows: Array<{ label: string; value: string }> = [];
  const pd = entry.personalization.phaseData;
  if (pd) {
    if (pd.menstruasiHariKe) phaseRows.push({ label: 'Hari menstruasi', value: pd.menstruasiHariKe });
    if (pd.menstruasiVolume) phaseRows.push({ label: 'Volume', value: pd.menstruasiVolume });
    if (pd.hamilUsia) phaseRows.push({ label: 'Usia kehamilan', value: pd.hamilUsia });
    if (pd.hamilPertama) phaseRows.push({ label: 'Kehamilan pertama', value: pd.hamilPertama });
    if (pd.pascaWaktu) phaseRows.push({ label: 'Sejak melahirkan', value: pd.pascaWaktu });
    if (pd.menyusuiUsiaBayi) phaseRows.push({ label: 'Usia bayi', value: pd.menyusuiUsiaBayi });
    if (pd.menyusuiMode) phaseRows.push({ label: 'Cara menyusui', value: pd.menyusuiMode });
    if (pd.periPola) phaseRows.push({ label: 'Pola menstruasi', value: pd.periPola });
    if (pd.menopauseWaktu) phaseRows.push({ label: 'Sejak menopause', value: pd.menopauseWaktu });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/tracker')} className="flex items-center gap-1 text-sycle-muted text-sm font-500 hover:text-rose transition-colors focus:outline-none">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Health Tracker
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-sycle-muted focus:outline-none focus:ring-2 focus:ring-rose/50"
            aria-label="Menu"
            aria-expanded={showMenu}
          >
            ···
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 bg-white rounded-2xl shadow-lg border border-sycle-border py-2 min-w-36 z-10">
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                className="block w-full text-left px-4 py-2 text-sm font-500 text-rose hover:bg-blush transition-colors"
              >
                Hapus Catatan
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="font-800 text-xl text-sycle-dark mb-1">{dateLabel}</h1>
      <p className="text-xs text-sycle-muted mb-6">
        Dibuat: {entry.createdAt} · Terakhir diperbarui: {entry.updatedAt}
      </p>

      <div className="space-y-4">
        {/* Kondisi Lingkungan */}
        <Section title="Kondisi Lingkungan" bg="bg-gradient-to-br from-blush/50 to-powder/30">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Lokasi', value: entry.location.split(',')[0] },
              { label: 'Suhu', value: `${entry.envData.temp}°C` },
              { label: 'Terasa seperti', value: `${entry.envData.feelsLike}°C` },
              { label: 'Kelembapan', value: `${entry.envData.humidity}%` },
              { label: 'Kualitas udara', value: entry.envData.airQuality },
              { label: 'PM2.5', value: `${entry.envData.pm25} µg/m³` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/70 rounded-xl p-2.5">
                <p className="text-xs text-sycle-muted">{label}</p>
                <p className="text-sm font-600 text-sycle-dark">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Konteks */}
        <Section title="Konteks yang Kamu Berikan">
          <div className="flex flex-wrap gap-2 mb-2">
            {entry.personalization.ageRange && <Chip label={entry.personalization.ageRange} />}
            {visibleContext.map(c => <Chip key={c} label={c} variant="rose" />)}
            {entry.personalization.activity && <Chip label={entry.personalization.activity} />}
            {entry.personalization.locationPref && <Chip label={entry.personalization.locationPref} />}
            {entry.personalization.outdoorDuration !== 'Tidak berada di luar' && (
              <Chip label={entry.personalization.outdoorDuration} />
            )}
          </div>
          {entry.personalization.resources.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {entry.personalization.resources.map(r => <Chip key={r} label={r} variant="sage" />)}
            </div>
          )}
        </Section>

        {/* Detail Fase */}
        {phaseRows.length > 0 && (
          <Section title="Detail Fase/Konteks" bg="bg-blush/20">
            <div className="space-y-1.5">
              {phaseRows.map(r => (
                <div key={r.label} className="flex items-center justify-between py-1 border-b border-sycle-border last:border-0">
                  <span className="text-xs text-sycle-muted font-500">{r.label}</span>
                  <span className="text-sm font-600 text-sycle-dark">{r.value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Yang Kamu Rasakan */}
        {entry.reflection && (
          <>
            <Section title="Yang Kamu Rasakan" bg="bg-blush/20">
              <div className="bg-powder/60 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-sycle-muted">
                  Skala ini menggambarkan apa yang kamu rasakan, bukan tingkat risiko kesehatan.
                </p>
              </div>
              <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Catatan pengguna</p>
              {ratedSymptoms.length > 0 ? (
                <div className="space-y-0">
                  {ratedSymptoms.map(([s, v]) => (
                    <div key={s} className="py-2.5 border-b border-sycle-border last:border-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-600 text-sycle-dark">{s}</span>
                        <span className="text-xs text-sycle-muted font-600">{v} / 4 — {SCALE_LABELS[v]}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-2 flex-1 rounded-full ${i <= v ? 'bg-rose/60' : 'bg-sycle-border/40'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-sycle-muted">Tidak ada keluhan yang dicatat.</p>
              )}
              {entry.reflection.bleeding && (
                <div className="mt-3 pt-3 border-t border-sycle-border">
                  <p className="text-xs text-sycle-muted font-600 mb-1">Pendarahan</p>
                  <p className="text-sm font-600 text-sycle-dark">{entry.reflection.bleeding}</p>
                </div>
              )}
              {entry.reflection.feedingPattern && entry.reflection.feedingPattern !== 'Tidak' && (
                <div className="mt-3 pt-3 border-t border-sycle-border">
                  <p className="text-xs text-sycle-muted font-600 mb-1">Pola menyusu</p>
                  <p className="text-sm font-600 text-sycle-dark">{entry.reflection.feedingPattern}</p>
                </div>
              )}
            </Section>

            {/* Detail Gejala (Member extended check-in) */}
            {entry.reflection.symptomDetails && Object.keys(entry.reflection.symptomDetails).length > 0 && (
              <Section title="Detail Gejala" bg="bg-lavender/20">
                <div className="space-y-3">
                  {Object.entries(entry.reflection.symptomDetails).map(([symptom, detail]) => (
                    <div key={symptom} className="bg-white rounded-xl border border-sycle-border p-3">
                      <p className="font-700 text-sm text-sycle-dark mb-2">{symptom}</p>
                      <div className="space-y-1">
                        {detail.onset && <DetailRow label="Mulai dirasakan" value={detail.onset} />}
                        {detail.duration && <DetailRow label="Durasi" value={detail.duration} />}
                        {detail.change && <DetailRow label="Dibanding biasanya" value={detail.change} />}
                        {detail.activityImpact && <DetailRow label="Dampak aktivitas" value={detail.activityImpact} />}
                        {detail.careAction && <DetailRow label="Yang dilakukan" value={detail.careAction} />}
                        {detail.careSeeking && <DetailRow label="Bantuan kesehatan" value={detail.careSeeking} />}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-sycle-muted mt-3">Catatan pribadi — tidak diinterpretasikan oleh SYCLE.</p>
              </Section>
            )}

            {entry.reflection.story && (
              <Section title="Ceritamu">
                <p className="text-sm text-sycle-dark leading-relaxed italic border-l-2 border-rose/30 pl-3">
                  "{entry.reflection.aiStory || entry.reflection.story}"
                </p>
                <p className="text-xs text-sycle-muted mt-2">Catatan pengguna — tidak diinterpretasikan oleh SYCLE.</p>
              </Section>
            )}
          </>
        )}

        {/* Topik */}
        <Section title="Topik yang Kamu Pelajari">
          <div className="space-y-2">
            {entry.topics.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-sycle-bg rounded-xl border border-sycle-border p-3">
                <EvidenceBadge badge={t.badge} />
                <span className="text-sm font-600 text-sycle-dark flex-1">{t.title}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Informasi Preventif */}
        <Section title="Informasi Preventif" bg="bg-powder/30">
          <ul className="space-y-2">
            {[
              { emoji: '💧', text: 'Minum air minimal 250ml setiap jam' },
              { emoji: '🌤', text: 'Batasi aktivitas luar pukul 10.00–14.00' },
              { emoji: '⏱', text: 'Istirahat di tempat sejuk setiap 30–45 menit' },
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-sycle-dark">
                <span>{a.emoji}</span> {a.text}
              </li>
            ))}
          </ul>
        </Section>

        {/* Sumber */}
        <Section title="Sumber">
          <div className="flex flex-wrap gap-2">
            {['WHO', 'BMKG', 'Nature Medicine'].map(s => (
              <span key={s} className="px-2.5 py-1 bg-sycle-bg border border-sycle-border rounded-lg text-xs font-500 text-sycle-dark">{s}</span>
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-6 space-y-2">
        {pdfState === 'idle' && (
          <button onClick={handlePDF} className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none">
            Download PDF
          </button>
        )}
        {pdfState === 'generating' && (
          <div className="w-full border border-sycle-border rounded-xl py-3 text-center text-sm text-sycle-muted flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin text-rose" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Membuat PDF...
          </div>
        )}
        {pdfState === 'done' && (
          <div className="w-full bg-sage text-green-800 rounded-xl py-3 text-center font-600 text-sm">
            ✓ PDF siap diunduh
          </div>
        )}
        {pdfState === 'error' && (
          <div className="w-full bg-blush text-rose rounded-xl py-3 text-center font-600 text-sm flex items-center justify-center gap-2">
            PDF belum dapat dibuat.
            <button onClick={handlePDF} className="underline">Coba lagi</button>
          </div>
        )}
        <button onClick={() => navigate('/tracker')} className="w-full bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">
          Kembali ke Health Tracker
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-sycle-dark/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm mx-auto p-6 shadow-2xl">
            <div className="w-10 h-1 bg-sycle-border rounded-full mx-auto mb-5 sm:hidden" />
            <h3 className="font-700 text-lg text-sycle-dark mb-2">Hapus catatan ini?</h3>
            <p className="text-sm text-sycle-muted mb-5">Catatan yang dihapus tidak akan muncul lagi di Journal.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-sycle-border rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Batal</button>
              <button onClick={handleDelete} className="flex-1 bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, bg = 'bg-white', children }: { title: string; bg?: string; children: React.ReactNode }) {
  return (
    <div className={`${bg} rounded-2xl border border-sycle-border p-4 shadow-sm`}>
      <p className="text-xs font-700 text-sycle-muted uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-sycle-muted">{label}</span>
      <span className="text-xs font-600 text-sycle-dark">{value}</span>
    </div>
  );
}

function Chip({ label, variant = 'default' }: { label: string; variant?: 'default' | 'rose' | 'sage' }) {
  const styles = {
    default: 'bg-sycle-bg border border-sycle-border text-sycle-dark',
    rose: 'bg-blush text-rose',
    sage: 'bg-sage text-green-800',
  };
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-500 ${styles[variant]}`}>{label}</span>;
}
