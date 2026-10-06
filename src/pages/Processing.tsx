"use client";
import { useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';

export default function Processing() {
  const navigate = useNavigate();
  const { personalization, envSource, evidenceLoading, envLoading } = useApp();

  useEffect(() => {
    if (!personalization) { navigate('/'); return; }
    const started = Date.now();
    const tick = window.setInterval(() => {
      const ready = !envLoading && !evidenceLoading;
      const minimum = Date.now() - started > 700;
      if (ready && minimum) {
        window.clearInterval(tick);
        navigate('/untukmu', { replace: true });
      }
    }, 150);
    const timeout = window.setTimeout(() => {
      window.clearInterval(tick);
      navigate('/untukmu', { replace: true });
    }, 3200);
    return () => { window.clearInterval(tick); window.clearTimeout(timeout); };
  }, [personalization, envLoading, evidenceLoading, navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-12 min-h-[calc(100vh-10rem)] flex flex-col justify-center">
      <div className="bg-white rounded-2xl border border-sycle-border p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-rose animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <h2 className="font-700 text-lg text-sycle-dark mb-2">Menyiapkan konteksmu…</h2>
        <p className="text-sm text-sycle-muted leading-relaxed mb-5">SYCLE menggabungkan kondisi lingkungan, konteks, dan evidence terkurasi. {envSource === 'live' ? 'Lokasi perangkat sudah aktif.' : 'Kamu dapat mengaktifkan lokasi jika belum.'}</p>
        <div className="space-y-2 text-left text-sm">
          <div className="rounded-xl bg-sycle-bg px-3 py-2.5">✓ Konteks pengguna siap</div>
          <div className={`rounded-xl px-3 py-2.5 ${envLoading ? 'bg-blush' : 'bg-sycle-bg'}`}>{envLoading ? '… Mengambil kondisi lingkungan' : envSource === 'live' ? '✓ Kondisi lingkungan live' : '✓ Data lingkungan fallback tersedia'}</div>
          <div className={`rounded-xl px-3 py-2.5 ${evidenceLoading ? 'bg-powder' : 'bg-sycle-bg'}`}>{evidenceLoading ? '… Mencari curated evidence' : '✓ Evidence retrieval siap'}</div>
        </div>
        <p className="text-xs text-sycle-muted bg-powder/60 rounded-xl px-4 py-2.5 mt-5">AI menjelaskan sumber yang telah dikurasi; bukan diagnosis.</p>
      </div>
    </div>
  );
}
