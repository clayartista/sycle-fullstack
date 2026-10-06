"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import { SCALE_LABELS } from '../types';

type TrackerTab = 'hari-ini' | 'kalender' | 'daftar' | 'ringkasan';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function HariIniView() {
  const navigate = useNavigate();
  const { journalEntries, envData, location } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = journalEntries.find(e => e.date === today);

  if (todayEntry) {
    const ratedSymptoms = todayEntry.reflection
      ? Object.entries(todayEntry.reflection.symptomScales).filter(([, v]) => v > 0)
      : [];
    return (
      <div className="space-y-4">
        <div className="bg-sage/30 border border-sage rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <p className="font-700 text-sm text-sycle-dark">Catatan hari ini sudah tersimpan</p>
            <p className="text-xs text-sycle-muted mt-0.5">
              {new Date(todayEntry.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Kondisi Lingkungan</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Lokasi', value: location.split(',')[0] },
              { label: 'Suhu', value: `${todayEntry.envData.temp}°C` },
              { label: 'Terasa seperti', value: `${todayEntry.envData.feelsLike}°C` },
              { label: 'Kualitas udara', value: todayEntry.envData.airQuality },
            ].map(m => (
              <div key={m.label} className="bg-sycle-bg rounded-xl p-2.5">
                <p className="text-xs text-sycle-muted">{m.label}</p>
                <p className="text-sm font-600 text-sycle-dark">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
        {ratedSymptoms.length > 0 && (
          <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
            <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Gejala yang Dicatat</p>
            <div className="space-y-2">
              {ratedSymptoms.map(([s, v]) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-sm text-sycle-dark">{s}</span>
                  <span className="text-xs font-600 text-sycle-muted bg-blush px-2 py-0.5 rounded-full">{v} / 4 — {SCALE_LABELS[v]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/tracker/${todayEntry.id}`)}
            className="flex-1 border border-sycle-border text-sycle-dark rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none"
          >
            Lihat Detail
          </button>
          <button
            onClick={() => navigate('/personalisasi')}
            className="flex-1 bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none"
          >
            Perbarui
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blush/40 to-powder/30 rounded-2xl p-5 border border-rose/10">
        <div className="flex items-center gap-2 mb-2 text-xs text-sycle-muted">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
          {location.split(',')[0]}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-800 text-sycle-dark">{envData.temp}°C</span>
          <span className="text-sm text-sycle-muted">{envData.weather}</span>
        </div>
        <div className="flex gap-4 text-xs text-sycle-muted">
          <span>Terasa seperti {envData.feelsLike}°C</span>
          <span>Udara: {envData.airQuality}</span>
        </div>
      </div>
      <div className="text-center py-6">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-700 text-sycle-dark mb-1">Belum ada catatan hari ini.</p>
        <p className="text-sm text-sycle-muted mb-5">Catat kondisimu dan pahami evidence yang relevan.</p>
        <button
          onClick={() => navigate('/personalisasi')}
          className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
        >
          Mulai Check-In Hari Ini
        </button>
      </div>
    </div>
  );
}

function CalendarView() {
  const { journalEntries } = useApp();
  const navigate = useNavigate();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const entryDates = new Set(journalEntries.map(e => e.date));

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 rounded-full hover:bg-blush transition-colors flex items-center justify-center focus:outline-none" aria-label="Bulan sebelumnya">
          <svg className="w-4 h-4 text-sycle-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h3 className="font-700 text-base text-sycle-dark">{MONTHS[month]} {year}</h3>
        <button onClick={next} className="w-8 h-8 rounded-full hover:bg-blush transition-colors flex items-center justify-center focus:outline-none" aria-label="Bulan berikutnya">
          <svg className="w-4 h-4 text-sycle-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-600 text-sycle-muted py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEntry = entryDates.has(dateStr);
          const entry = journalEntries.find(e => e.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          return (
            <button
              key={day}
              onClick={() => entry && navigate(`/tracker/${entry.id}`)}
              disabled={!hasEntry}
              className={`relative aspect-square rounded-xl flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose/50 ${
                hasEntry ? 'hover:bg-rose/10 cursor-pointer font-600' : 'cursor-default'
              } ${isToday ? 'ring-2 ring-rose/30' : ''}`}
            >
              <span className={hasEntry ? 'text-sycle-dark' : 'text-sycle-muted/50'}>{day}</span>
              {hasEntry && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose rounded-full" aria-label="Ada catatan" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-sycle-muted text-center">● = Ada catatan</p>
    </div>
  );
}

function ListView() {
  const { journalEntries } = useApp();
  const navigate = useNavigate();

  if (journalEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📋</div>
        <p className="font-600 text-sycle-dark mb-1">Belum ada catatan tersimpan.</p>
        <p className="text-sm text-sycle-muted mb-4">Setelah kamu menyimpan check-in, catatanmu akan muncul di sini.</p>
        <button onClick={() => navigate('/personalisasi')} className="bg-rose text-white px-6 py-3 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Mulai Sekarang</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {journalEntries.map(entry => (
        <button
          key={entry.id}
          onClick={() => navigate(`/tracker/${entry.id}`)}
          className="w-full text-left bg-white rounded-2xl border border-sycle-border p-4 shadow-sm hover:border-rose/30 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-rose/50"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-700 text-base text-sycle-dark">
                {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-sycle-muted mt-0.5">{entry.location.split(',')[0]}</p>
            </div>
            <svg className="w-4 h-4 text-sycle-muted mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-blush rounded-lg text-xs font-500 text-sycle-dark">{entry.envData.temp}°C · {entry.envData.airQuality}</span>
            <span className="px-2.5 py-1 bg-powder rounded-lg text-xs font-500 text-sycle-dark">{entry.personalization.locationPref}</span>
            {entry.personalization.outdoorDuration !== 'Tidak berada di luar' && (
              <span className="px-2.5 py-1 bg-sage rounded-lg text-xs font-500 text-sycle-dark">{entry.personalization.outdoorDuration}</span>
            )}
            {entry.reflection && (() => {
              const top = Object.entries(entry.reflection.symptomScales).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0];
              return top ? (
                <span className="px-2.5 py-1 bg-lavender rounded-lg text-xs font-500 text-sycle-dark">
                  {top[0]} · {top[1]}/4
                </span>
              ) : null;
            })()}
          </div>
        </button>
      ))}
    </div>
  );
}

function SummaryView() {
  const { journalEntries } = useApp();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthEntries = journalEntries.filter(e => e.date.startsWith(thisMonth));

  const total = monthEntries.length;
  const symptomCounts: Record<string, number> = {};
  const contextCounts: Record<string, number> = {};
  let outdoorDays = 0;
  let noSymptomDays = 0;

  monthEntries.forEach(e => {
    const ratedSymptoms = e.reflection
      ? Object.entries(e.reflection.symptomScales).filter(([, v]) => v > 0)
      : [];
    if (ratedSymptoms.length > 0) {
      ratedSymptoms.forEach(([s]) => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; });
    } else noSymptomDays++;
    e.personalization.womenContext.filter(c => c !== 'Saya tidak ingin menjawab').forEach(c => {
      contextCounts[c] = (contextCounts[c] || 0) + 1;
    });
    if (e.personalization.locationPref === 'Di luar ruangan') outdoorDays++;
  });

  const symptomEntries = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
  const contextEntries = Object.entries(contextCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="bg-rose/5 rounded-2xl border border-rose/20 p-5 text-center">
        <p className="text-4xl font-800 text-sycle-dark mb-1">{total}</p>
        <p className="text-sm text-sycle-muted">Hari memiliki catatan — {MONTHS[now.getMonth()]} {now.getFullYear()}</p>
      </div>

      {symptomEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Gejala yang Kamu Catat</p>
          <div className="space-y-2">
            {symptomEntries.map(([s, count]) => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-sm text-sycle-dark">{s}</span>
                <span className="text-sm font-600 text-sycle-dark bg-blush px-2.5 py-0.5 rounded-full">{count} hari</span>
              </div>
            ))}
            {noSymptomDays > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-sycle-dark">Tidak ada keluhan</span>
                <span className="text-sm font-600 text-sycle-dark bg-sage px-2.5 py-0.5 rounded-full">{noSymptomDays} hari</span>
              </div>
            )}
          </div>
          <p className="text-xs text-sycle-muted mt-3 pt-3 border-t border-sycle-border">
            Ini adalah hitungan faktual catatan kamu. SYCLE tidak menginterpretasikan korelasi atau sebab-akibat.
          </p>
        </div>
      )}

      {contextEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Konteks</p>
          <div className="space-y-2">
            {contextEntries.map(([c, count]) => (
              <div key={c} className="flex items-center justify-between">
                <span className="text-sm text-sycle-dark">{c}</span>
                <span className="text-sm font-600 text-sycle-dark bg-lavender px-2.5 py-0.5 rounded-full">{count} hari</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
        <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Aktivitas</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-sycle-dark">Di luar ruangan</span>
          <span className="text-sm font-600 text-sycle-dark bg-powder px-2.5 py-0.5 rounded-full">{outdoorDays} hari</span>
        </div>
      </div>
    </div>
  );
}

export default function HealthTracker() {
  const navigate = useNavigate();
  const { isLoggedIn } = useApp();
  const [tab, setTab] = useState<TrackerTab>('hari-ini');

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="font-700 text-xl text-sycle-dark mb-2">Health Tracker tersedia untuk Member</h2>
        <p className="text-sm text-sycle-muted mb-2">Simpan catatan harianmu, lihat riwayat, dan pantau kondisimu dari waktu ke waktu.</p>
        <p className="text-xs text-sycle-muted mb-6">Kamu tetap dapat mencatat gejalamu sebagai Tamu — datamu tersimpan untuk sesi ini.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/daftar')} className="bg-rose text-white px-6 py-3 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Buat Akun</button>
          <button onClick={() => navigate('/masuk')} className="border border-sycle-border px-6 py-3 rounded-xl font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Masuk</button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const tabLabels: Record<TrackerTab, string> = {
    'hari-ini': 'Hari Ini',
    kalender: 'Kalender',
    daftar: 'Daftar',
    ringkasan: 'Ringkasan',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-800 text-2xl text-sycle-dark">Health Tracker</h1>
        <button
          onClick={() => navigate('/personalisasi')}
          className="bg-rose text-white px-4 py-2 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
        >
          + Check-In
        </button>
      </div>

      <div className="flex bg-sycle-bg rounded-2xl border border-sycle-border p-1 mb-6 gap-0.5">
        {(Object.keys(tabLabels) as TrackerTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-600 transition-all focus:outline-none ${
              tab === t ? 'bg-white shadow-sm text-sycle-dark' : 'text-sycle-muted hover:text-sycle-dark'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-sycle-border p-5 shadow-sm">
        {tab === 'hari-ini' && <HariIniView />}
        {tab === 'kalender' && <CalendarView />}
        {tab === 'daftar' && <ListView />}
        {tab === 'ringkasan' && (
          <>
            <h3 className="font-700 text-base text-sycle-dark mb-4">
              Ringkasan {MONTHS[now.getMonth()]} {now.getFullYear()}
            </h3>
            <SummaryView />
          </>
        )}
      </div>
    </div>
  );
}
