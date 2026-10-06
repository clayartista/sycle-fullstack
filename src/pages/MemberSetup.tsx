"use client";
import { useState, type ReactNode } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import { InfoButton } from '../components/InfoModal';
import LocationPermissionCard from '../components/location/LocationPermissionCard';
import Logo from '../components/Logo';
import type { SavedContext } from '../context/AppContext';

type SetupStep = 'intro' | '1' | '2' | 'done';

function ProgressBar({ step }: { step: number }) {
  return <div className="flex items-center gap-2 mb-6"><div className="flex gap-1 flex-1">{[1, 2].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-rose' : 'bg-sycle-border'}`} />)}</div><span className="text-xs text-sycle-muted font-500 whitespace-nowrap">{step} dari 2</span></div>;
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`px-4 py-2.5 rounded-xl text-sm font-500 border transition-all focus:outline-none focus:ring-2 focus:ring-rose/50 ${selected ? 'bg-rose text-white border-rose shadow-sm' : 'bg-white text-sycle-dark border-sycle-border hover:border-rose/40 hover:bg-blush/50'}`} aria-pressed={selected}>{label}</button>;
}

export default function MemberSetup() {
  const navigate = useNavigate();
  const { completeMemberSetup } = useApp();
  const [step, setStep] = useState<SetupStep>('intro');
  const [ageRange, setAgeRange] = useState('');
  const [womenContext, setWomenContext] = useState<string[]>([]);
  const [preferredLocation, setPreferredLocation] = useState('Lokasi saya');

  const toggleContext = (label: string) => {
    if (label === 'Saya tidak ingin menjawab') { setWomenContext((current) => current.includes(label) ? [] : [label]); return; }
    const filtered = womenContext.filter((item) => item !== 'Saya tidak ingin menjawab');
    setWomenContext(filtered.includes(label) ? filtered.filter((item) => item !== label) : [...filtered, label]);
  };

  const handleFinish = () => {
    const ctx: SavedContext = { ageRange: ageRange || 'Saya tidak ingin menjawab', womenContext, preferredLocation };
    completeMemberSetup(ctx);
    setStep('done');
  };

  if (step === 'done') return <SetupShell><div className="text-center"><div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><h2 className="font-700 text-xl text-sycle-dark mb-2">Konteksmu sudah siap ✓</h2><p className="text-sm text-sycle-muted mb-6 leading-relaxed">Sekarang SYCLE bisa langsung menyesuaikan kondisi lingkungan, evidence, dan aksi dengan konteksmu.</p><button onClick={() => navigate('/personalisasi', { replace: true })} className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark">Lihat untukmu hari ini</button></div></SetupShell>;

  if (step === 'intro') return <SetupShell><div className="w-14 h-14 bg-rose/10 rounded-2xl flex items-center justify-center mb-5"><span className="text-3xl">🌿</span></div><h2 className="font-700 text-2xl text-sycle-dark mb-2">Selamat datang di SYCLE</h2><div className="bg-sage/40 border border-sage rounded-2xl p-4 mb-4"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Value utama</p><p className="text-sm text-sycle-dark leading-relaxed">Dalam beberapa langkah singkat, konteksmu akan dihubungkan dengan lingkungan sekitar, curated evidence, catatan tubuh, dan aksi praktis.</p></div><p className="text-sm text-sycle-muted mb-6 leading-relaxed">Tidak perlu melewati screen ringkasan dan tindakan terpisah.</p><button onClick={() => setStep('1')} className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark">Lengkapi Konteks</button><button onClick={() => navigate('/', { replace: true })} className="w-full mt-3 text-sycle-muted text-sm py-2">Lewati untuk sekarang</button></SetupShell>;

  return <SetupShell><ProgressBar step={Number(step)} />
    {step === '1' && <>
      <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Tahap 1</p><h2 className="font-700 text-xl text-sycle-dark mb-4">Tentang kamu</h2>
      <p className="text-sm font-700 text-sycle-dark mb-2">Rentang usia</p><div className="flex flex-wrap gap-2 mb-5">{['Di bawah 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+', 'Saya tidak ingin menjawab'].map((option) => <Chip key={option} label={option} selected={ageRange === option} onClick={() => setAgeRange(option)} />)}</div>
      <p className="text-sm font-700 text-sycle-dark mb-2">Konteks saat ini</p><p className="text-xs text-sycle-muted mb-3">Pilih semua yang sesuai.</p>
      <div className="flex flex-wrap gap-2 mb-5">{['Sedang menstruasi', 'Hamil', 'Pascapersalinan', 'Menyusui', 'Perimenopause', 'Menopause', 'Lainnya', 'Saya tidak ingin menjawab'].map((label) => <div key={label} className="flex items-center gap-1"><Chip label={label} selected={womenContext.includes(label)} onClick={() => toggleContext(label)} />{['Sedang menstruasi','Hamil','Perimenopause','Menopause'].includes(label) && <InfoButton term={label.toLowerCase().replace('sedang ','').replace(' ','-') as any} />}</div>)}</div>
      <button onClick={() => setStep('2')} disabled={!ageRange} className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm disabled:opacity-40">Lanjut ke lokasi</button>
    </>}
    {step === '2' && <>
      <p className="text-xs font-600 text-sycle-muted uppercase tracking-wide mb-1">Tahap 2</p><h2 className="font-700 text-xl text-sycle-dark mb-2">Aktifkan konteks lingkungan</h2><p className="text-sm text-sycle-muted leading-relaxed mb-5">Izin lokasi membuat kondisi lingkungan mengikuti tempatmu saat ini.</p><LocationPermissionCard /><div className="mt-4 rounded-2xl bg-sycle-bg border border-sycle-border p-4"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Privasi</p><p className="text-sm text-sycle-dark">Koordinat perangkat dipakai untuk mengambil kondisi lingkungan dan tidak disimpan sebagai alamat profil.</p></div><div className="flex gap-3 mt-5"><button onClick={() => setStep('1')} className="px-5 py-3.5 border border-sycle-border rounded-xl text-sm font-600 text-sycle-dark">Kembali</button><button onClick={handleFinish} className="flex-1 bg-rose text-white rounded-xl py-3.5 font-600 text-sm">Simpan & lanjut</button></div>
    </>}
  </SetupShell>;
}

function SetupShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-sycle-bg flex flex-col items-center justify-center px-4 py-8"><div className="w-full max-w-lg"><div className="flex justify-center mb-6"><Logo size="md" /></div><div className="bg-white rounded-3xl border border-sycle-border p-6 shadow-sm">{children}</div></div></div>;
}
