"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';

type JournalTab = 'kalender' | 'daftar' | 'ringkasan';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function CalendarView() {
  const { journalEntries } = useApp();
  const navigate = useNavigate();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8); // 0-indexed, September

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
              onClick={() => entry && navigate(`/journal/${entry.id}`)}
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
        <div className="text-4xl mb-4">📓</div>
        <p className="font-600 text-sycle-dark mb-1">Belum ada catatan.</p>
        <p className="text-sm text-sycle-muted mb-4">Mulai perjalananmu hari ini.</p>
        <button onClick={() => navigate('/personalisasi')} className="bg-rose text-white px-6 py-3 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Mulai Sekarang</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {journalEntries.map(entry => (
        <button
          key={entry.id}
          onClick={() => navigate(`/journal/${entry.id}`)}
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
              const top = Object.entries(entry.reflection.symptomScales).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1])[0];
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

  const total = journalEntries.length;
  const symptomCounts: Record<string, number> = {};
  let noSymptomDays = 0;
  let outdoorDays = 0;
  let indoorDays = 0;
  let bothDays = 0;

  journalEntries.forEach(e => {
    const ratedSymptoms = e.reflection
      ? Object.entries(e.reflection.symptomScales).filter(([, v]) => v > 0)
      : [];
    if (ratedSymptoms.length > 0) {
      ratedSymptoms.forEach(([s]) => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; });
    } else noSymptomDays++;
    if (e.personalization.locationPref === 'Di luar ruangan') outdoorDays++;
    else if (e.personalization.locationPref === 'Di dalam ruangan') indoorDays++;
    else bothDays++;
  });

  const symptomEntries = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="bg-rose/5 rounded-2xl border border-rose/20 p-5 text-center">
        <p className="text-4xl font-800 text-sycle-dark mb-1">{total}</p>
        <p className="text-sm text-sycle-muted">Hari memiliki catatan</p>
      </div>

      <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
        <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Apa yang Dirasakan</p>
        <div className="space-y-2">
          {symptomEntries.map(([s, count]) => (
            <div key={s} className="flex items-center justify-between">
              <span className="text-sm text-sycle-dark">{s}</span>
              <span className="text-sm font-600 text-sycle-dark bg-blush px-2.5 py-0.5 rounded-full">{count} hari</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-sm text-sycle-dark">Tidak ada keluhan</span>
            <span className="text-sm font-600 text-sycle-dark bg-sage px-2.5 py-0.5 rounded-full">{noSymptomDays} hari</span>
          </div>
        </div>
        <p className="text-xs text-sycle-muted mt-3 pt-3 border-t border-sycle-border">
          Ini adalah hitungan faktual catatan kamu. SYCLE tidak menginterpretasikan korelasi atau sebab-akibat.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
        <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Aktivitas</p>
        <div className="space-y-2">
          {[
            { label: 'Di luar ruangan', count: outdoorDays, bg: 'bg-powder' },
            { label: 'Di dalam ruangan', count: indoorDays, bg: 'bg-lavender' },
            { label: 'Keduanya', count: bothDays, bg: 'bg-sage' },
          ].map(({ label, count, bg }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-sycle-dark">{label}</span>
              <span className={`text-sm font-600 text-sycle-dark ${bg} px-2.5 py-0.5 rounded-full`}>{count} hari</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const navigate = useNavigate();
  const { isLoggedIn, journalEntries } = useApp();
  const [tab, setTab] = useState<JournalTab>('kalender');

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">📓</div>
        <h2 className="font-700 text-xl text-sycle-dark mb-2">Journal tersedia untuk Member</h2>
        <p className="text-sm text-sycle-muted mb-6">Buat akun untuk menyimpan dan melanjutkan catatanmu.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/daftar')} className="bg-rose text-white px-6 py-3 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Buat Akun</button>
          <button onClick={() => navigate('/masuk')} className="border border-sycle-border px-6 py-3 rounded-xl font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Masuk</button>
        </div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-800 text-2xl text-sycle-dark">Journal</h1>
        <button
          onClick={() => navigate('/personalisasi')}
          className="bg-rose text-white px-4 py-2 rounded-xl font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
        >
          + Hari Ini
        </button>
      </div>

      <div className="flex bg-sycle-bg rounded-2xl border border-sycle-border p-1 mb-6">
        {(['kalender', 'daftar', 'ringkasan'] as JournalTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-600 transition-all capitalize focus:outline-none ${
              tab === t ? 'bg-white shadow-sm text-sycle-dark' : 'text-sycle-muted hover:text-sycle-dark'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-sycle-border p-5 shadow-sm">
        {tab === 'kalender' && <CalendarView />}
        {tab === 'daftar' && <ListView />}
        {tab === 'ringkasan' && (
          <>
            <h3 className="font-700 text-base text-sycle-dark mb-4">
              Ringkasan {MONTHS[now.getMonth()]}
            </h3>
            <SummaryView />
          </>
        )}
      </div>
    </div>
  );
}
