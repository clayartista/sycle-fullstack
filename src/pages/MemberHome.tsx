"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import { InfoButton } from '../components/InfoModal';

// STATE B — New member (setup complete, no journal history yet)
function NewMemberHome() {
  const navigate = useNavigate();
  const { userName, envData, location, savedContext, isFirstVisit, setIsFirstVisit } = useApp();

  const greeting = isFirstVisit ? `Selamat datang, ${userName} 👋` : `Selamat datang kembali, ${userName} 👋`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-800 text-2xl text-sycle-dark">{greeting}</h1>
        {isFirstVisit && (
          <p className="text-sm text-sycle-muted mt-1">Ini adalah kunjungan pertamamu. Yuk mulai!</p>
        )}
      </div>

      {/* Environmental card */}
      <div className="bg-gradient-to-br from-rose/5 via-blush to-powder rounded-2xl p-5 border border-rose/10 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-sycle-muted">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
              {location.split(',')[0]}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-800 text-sycle-dark">{envData.temp}°C</span>
              <span className="text-base text-sycle-muted">{envData.weather}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-sycle-muted mt-1">
              <span>Terasa seperti {envData.feelsLike}°C</span>
              <InfoButton term="terasa-seperti" />
            </div>
          </div>
          <span className="text-3xl">☀️</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Kelembapan', value: `${envData.humidity}%` },
            { label: 'Udara', value: envData.airQuality },
            { label: 'PM2.5', value: `${envData.pm25}` },
          ].map(m => (
            <div key={m.label} className="bg-white/60 rounded-xl p-2">
              <p className="text-xs text-sycle-muted">{m.label}</p>
              <p className="text-sm font-700 text-sycle-dark">{m.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-sycle-muted text-center">Data simulasi untuk prototype · BMKG</p>
      </div>

      {/* Primary CTA — start today */}
      <div className="bg-white rounded-2xl border border-sycle-border p-5 shadow-sm mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-rose/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <p className="font-700 text-base text-sycle-dark mb-0.5">Apa relevansinya untukmu hari ini?</p>
            {savedContext && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="px-2 py-0.5 bg-lavender rounded-lg text-xs font-500 text-sycle-dark">{savedContext.ageRange}</span>
                {savedContext.womenContext.map(c => (
                  <span key={c} className="px-2 py-0.5 bg-blush rounded-lg text-xs font-500 text-rose">{c}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/personalisasi')}
          className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none focus:ring-2 focus:ring-rose/50"
        >
          Temukan Informasi Hari Ini
        </button>
      </div>

      {/* Empty journal states */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Health Tracker</p>
          <p className="text-sm text-sycle-muted mb-3">Belum ada catatan hari ini.</p>
          <button
            onClick={() => navigate('/personalisasi')}
            className="text-sm text-rose font-600 hover:underline focus:outline-none"
          >
            Mulai hari ini →
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Catatan Terbaru</p>
          <p className="text-sm text-sycle-muted mb-2">Belum ada catatan tersimpan.</p>
          <p className="text-xs text-sycle-muted leading-relaxed mb-3">Setelah kamu menyimpan hasil SYCLE, catatanmu akan muncul di sini.</p>
          <button
            onClick={() => navigate('/personalisasi')}
            className="text-sm text-rose font-600 hover:underline focus:outline-none"
          >
            Temukan Informasi Hari Ini →
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-lavender/30 rounded-2xl border border-lavender p-4">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-2">Belajar 1 Menit</p>
          <p className="font-600 text-sm text-sycle-dark mb-1">Apa itu PM2.5?</p>
          <p className="text-xs text-sycle-muted mb-3">Kenali partikel halus di udara dan dampaknya.</p>
          <button onClick={() => navigate('/pelajari')} className="text-xs text-rose font-600 hover:underline focus:outline-none">Baca sekarang →</button>
        </div>
        <div className="bg-sage/30 rounded-2xl border border-sage p-4">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-2">Faskes Terdekat</p>
          <p className="font-600 text-sm text-sycle-dark mb-1">Temukan fasilitas kesehatan di sekitarmu</p>
          <button onClick={() => navigate('/healthcare')} className="text-xs text-rose font-600 hover:underline focus:outline-none mt-4 block">Buka Healthcare →</button>
        </div>
      </div>
    </div>
  );
}

// STATE C — Established member with history
function EstablishedMemberHome() {
  const navigate = useNavigate();
  const { userName, envData, location, savedContext, journalEntries, updatePersonalizationFromQuickCheckIn, isFirstVisit, setIsFirstVisit } = useApp();
  const [contextConfirmed, setContextConfirmed] = useState(false);
  const [checkinActivity, setCheckinActivity] = useState('');
  const [checkinDuration, setCheckinDuration] = useState('');

  const greeting = isFirstVisit ? `Selamat datang, ${userName} 👋` : `Selamat datang kembali, ${userName} 👋`;

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = journalEntries.find(e => e.date === today);
  const recentEntries = journalEntries.slice(0, 3);

  const handleQuickCheckIn = () => {
    if (checkinActivity) {
      updatePersonalizationFromQuickCheckIn({
        locationPref: checkinActivity,
        outdoorDuration: checkinDuration || 'Tidak berada di luar',
      });
    }
    setIsFirstVisit(false);
    navigate('/memproses');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-sm text-sycle-muted">Halo,</p>
        <h1 className="font-800 text-2xl text-sycle-dark">{greeting}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Environmental card */}
        <div className="bg-gradient-to-br from-rose/5 via-blush to-powder rounded-2xl p-5 border border-rose/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs text-sycle-muted">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
                {location.split(',')[0]}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-800 text-sycle-dark">{envData.temp}°C</span>
                <span className="text-base text-sycle-muted font-500">{envData.weather}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-sycle-muted mt-1">
                <span>Terasa seperti {envData.feelsLike}°C</span>
                <InfoButton term="terasa-seperti" />
              </div>
            </div>
            <span className="text-3xl">☀️</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Kelembapan', value: `${envData.humidity}%` },
              { label: 'Udara', value: envData.airQuality },
              { label: 'PM2.5', value: `${envData.pm25}` },
            ].map(m => (
              <div key={m.label} className="bg-white/60 rounded-xl p-2">
                <p className="text-xs text-sycle-muted">{m.label}</p>
                <p className="text-sm font-700 text-sycle-dark">{m.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-sycle-muted text-center">Data simulasi untuk prototype · BMKG</p>
        </div>

        {/* Saved context + quick check-in */}
        <div className="space-y-3">
          {savedContext && (
            <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide">Konteksmu</p>
                {!contextConfirmed && (
                  <span className="text-xs bg-rose/10 text-rose px-2 py-0.5 rounded-full font-500">Periksa</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2.5 py-1 bg-lavender rounded-lg text-xs font-500 text-sycle-dark">{savedContext.ageRange}</span>
                {savedContext.womenContext.map(c => (
                  <span key={c} className="px-2.5 py-1 bg-blush rounded-lg text-xs font-500 text-rose">{c}</span>
                ))}
              </div>
              {!contextConfirmed ? (
                <div>
                  <p className="text-xs text-sycle-muted mb-2">Masih sesuai?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setContextConfirmed(true)} className="flex-1 bg-sage text-green-800 rounded-lg py-2 text-xs font-600 hover:opacity-90 transition-opacity focus:outline-none">Ya</button>
                    <button onClick={() => navigate('/saya')} className="flex-1 border border-sycle-border text-sycle-dark rounded-lg py-2 text-xs font-600 hover:bg-blush transition-colors focus:outline-none">Perbarui</button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-sage font-600">✓ Konteks dikonfirmasi</p>
              )}
            </div>
          )}

          {/* Quick Check-In */}
          <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
            <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-3">Check-In Hari Ini</p>
            <p className="text-sm font-600 text-sycle-dark mb-2">Aktivitasmu hari ini?</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {['Dalam ruangan', 'Di luar', 'Keduanya'].map(a => (
                <button
                  key={a}
                  onClick={() => setCheckinActivity(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-500 border transition-all focus:outline-none ${checkinActivity === a ? 'bg-rose text-white border-rose' : 'border-sycle-border hover:border-rose/40'}`}
                >
                  {a}
                </button>
              ))}
            </div>
            {checkinActivity !== 'Dalam ruangan' && checkinActivity !== '' && (
              <>
                <p className="text-sm font-600 text-sycle-dark mb-2">Berapa lama di luar?</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {['<1 jam', '1–3 jam', '3–6 jam', '>6 jam'].map(d => (
                    <button
                      key={d}
                      onClick={() => setCheckinDuration(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-500 border transition-all focus:outline-none ${checkinDuration === d ? 'bg-rose text-white border-rose' : 'border-sycle-border hover:border-rose/40'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button
              onClick={handleQuickCheckIn}
              disabled={!checkinActivity}
              className="w-full bg-rose text-white rounded-xl py-3 font-600 text-sm hover:bg-rose-dark transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-rose/50"
            >
              Temukan untuk Hari Ini
            </button>
          </div>
        </div>
      </div>

      {/* Journal section */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide">Health Tracker</p>
            <button onClick={() => navigate('/tracker')} className="text-xs text-rose font-600 hover:underline focus:outline-none">Lihat semua</button>
          </div>
          {todayEntry ? (
            <div className="bg-sycle-bg rounded-xl border border-sycle-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-600 text-sycle-dark">{todayEntry.envData.temp}°C</span>
                <span className="text-xs text-sycle-muted">{todayEntry.envData.airQuality}</span>
              </div>
              {todayEntry.reflection && (() => {
                const top = Object.entries(todayEntry.reflection.symptomScales).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]);
                return top.length > 0 ? (
                  <p className="text-xs text-sycle-muted">{top.map(([s]) => s).join(', ')} · {top[0][1]}/4</p>
                ) : null;
              })()}
              <button onClick={() => navigate(`/tracker/${todayEntry.id}`)} className="mt-2 text-xs text-rose font-600 hover:underline focus:outline-none">Lihat Catatan →</button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-sycle-muted mb-2">Belum ada catatan hari ini.</p>
              <button onClick={() => navigate('/personalisasi')} className="text-sm text-rose font-600 hover:underline focus:outline-none">Mulai hari ini →</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-sycle-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide">Catatan Terbaru</p>
            <button onClick={() => navigate('/tracker')} className="text-xs text-rose font-600 hover:underline focus:outline-none">Semua</button>
          </div>
          <div className="space-y-2">
            {recentEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => navigate(`/tracker/${entry.id}`)}
                className="w-full text-left bg-sycle-bg rounded-xl border border-sycle-border p-3 hover:border-rose/30 transition-all focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-600 text-sycle-dark">
                    {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-xs text-sycle-muted">{entry.envData.temp}°C</span>
                </div>
                {entry.reflection && (() => {
                  const top = Object.entries(entry.reflection.symptomScales).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1])[0];
                  return top ? <p className="text-xs text-sycle-muted mt-0.5">{top[0]} · {top[1]}/4</p> : null;
                })()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Learn + Faskes */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="bg-lavender/30 rounded-2xl border border-lavender p-4">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-2">Belajar 1 Menit</p>
          <p className="font-600 text-sm text-sycle-dark mb-1">Apa itu PM2.5 dan mengapa penting?</p>
          <p className="text-xs text-sycle-muted mb-3">Kenali partikel halus di udara dan dampaknya bagi kesehatan.</p>
          <button onClick={() => navigate('/pelajari')} className="text-xs text-rose font-600 hover:underline focus:outline-none">Baca sekarang →</button>
        </div>
        <div className="bg-sage/30 rounded-2xl border border-sage p-4">
          <p className="text-xs font-700 text-sycle-muted uppercase tracking-wide mb-2">Healthcare</p>
          <p className="font-600 text-sm text-sycle-dark mb-1">Fasilitas Kesehatan Terdekat</p>
          <p className="text-xs text-sycle-muted mb-3">Temukan puskesmas, klinik, dan rumah sakit di sekitarmu.</p>
          <button onClick={() => navigate('/healthcare')} className="text-xs text-rose font-600 hover:underline focus:outline-none">Buka Healthcare →</button>
        </div>
      </div>
    </div>
  );
}

export default function MemberHome() {
  const { memberSetupComplete, journalEntries } = useApp();

  // STATE B: Setup complete but no journal history → new member view
  // STATE C: Setup complete with history → established member view
  const isEstablished = memberSetupComplete && journalEntries.length > 0;

  return isEstablished ? <EstablishedMemberHome /> : <NewMemberHome />;
}
