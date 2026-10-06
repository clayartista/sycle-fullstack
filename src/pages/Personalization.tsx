"use client";

import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import { InfoButton } from '../components/InfoModal';
import LocationPermissionCard from '../components/location/LocationPermissionCard';
import ContextRelevanceCard from '../components/personalization/ContextRelevanceCard';
import type { PersonalizationData, ContextPhaseData } from '../types';

const PHASE_CONTEXTS = ['Sedang menstruasi', 'Hamil', 'Pascapersalinan', 'Menyusui', 'Perimenopause', 'Menopause'];
const CONFLICT_PAIRS = [
  ['Hamil', 'Sedang menstruasi'],
  ['Hamil', 'Menopause'],
  ['Hamil', 'Perimenopause'],
];

type Step = 'intro' | 'context-confirm' | 'context' | 'today';

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-500 border transition-all focus:outline-none focus:ring-2 focus:ring-rose/50 ${
        selected ? 'bg-rose text-white border-rose shadow-sm' : 'bg-white text-sycle-dark border-sycle-border hover:border-rose/40 hover:bg-blush/50'
      }`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 py-1"><span className="text-xs text-sycle-muted">{label}</span><span className="text-sm font-600 text-sycle-dark text-right">{value}</span></div>;
}

function PhaseQuestion({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="text-xs font-700 text-sycle-muted mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => <Chip key={option} label={option} selected={value === option} onClick={() => onChange(value === option ? '' : option)} />)}
      </div>
    </div>
  );
}

function ContextDetails({ data, setData }: { data: PersonalizationData; setData: (value: PersonalizationData) => void }) {
  const phaseData = data.phaseData || {};
  const update = (key: keyof ContextPhaseData, value: string) => setData({ ...data, phaseData: { ...phaseData, [key]: phaseData[key] === value ? undefined : value } });
  const ctx = data.womenContext;
  const sections = [] as ReactNode[];

  if (ctx.includes('Sedang menstruasi')) {
    sections.push(<PhaseQuestion key="menstruasi" label="Hari ke berapa menstruasimu saat ini?" options={['Hari 1', 'Hari 2', 'Hari 3', 'Hari 4', 'Hari 5', '>5 hari', 'Tidak yakin']} value={phaseData.menstruasiHariKe || ''} onChange={(v) => update('menstruasiHariKe', v)} />);
    sections.push(<PhaseQuestion key="volume" label="Bagaimana aliran menstruasimu hari ini?" options={['Ringan', 'Sedang', 'Banyak', 'Lebih banyak dari biasanya', 'Tidak yakin']} value={phaseData.menstruasiVolume || ''} onChange={(v) => update('menstruasiVolume', v)} />);
  }
  if (ctx.includes('Hamil')) {
    sections.push(<PhaseQuestion key="hamil-usia" label="Usia kehamilan saat ini?" options={['Trimester 1', 'Trimester 2', 'Trimester 3', 'Tidak yakin']} value={phaseData.hamilUsia || ''} onChange={(v) => update('hamilUsia', v)} />);
    sections.push(<PhaseQuestion key="hamil-first" label="Apakah ini kehamilan pertama?" options={['Ya', 'Tidak', 'Saya tidak ingin menjawab']} value={phaseData.hamilPertama || ''} onChange={(v) => update('hamilPertama', v)} />);
    if (phaseData.hamilPertama === 'Tidak') sections.push(<PhaseQuestion key="hamil-number" label="Ini kehamilan yang keberapa?" options={['2', '3', '4+', 'Saya tidak ingin menjawab']} value={phaseData.hamilNomor || ''} onChange={(v) => update('hamilNomor', v)} />);
  }
  if (ctx.includes('Pascapersalinan')) sections.push(<PhaseQuestion key="pasca" label="Kapan kamu melahirkan?" options={['<1 minggu', '1–2 minggu', '3–6 minggu', '>6 minggu', 'Saya tidak ingin menjawab']} value={phaseData.pascaWaktu || ''} onChange={(v) => update('pascaWaktu', v)} />);
  if (ctx.includes('Menyusui')) {
    sections.push(<PhaseQuestion key="bayi" label="Usia bayi yang sedang kamu susui?" options={['<1 bulan', '1–3 bulan', '4–6 bulan', '7–12 bulan', '>12 bulan', 'Saya tidak ingin menjawab']} value={phaseData.menyusuiUsiaBayi || ''} onChange={(v) => update('menyusuiUsiaBayi', v)} />);
    sections.push(<PhaseQuestion key="mode" label="Saat ini kamu:" options={['Menyusui langsung', 'Memerah ASI', 'Keduanya', 'Kombinasi ASI dan susu lain', 'Saya tidak ingin menjawab']} value={phaseData.menyusuiMode || ''} onChange={(v) => update('menyusuiMode', v)} />);
  }
  if (ctx.includes('Perimenopause')) sections.push(<PhaseQuestion key="peri" label="Bagaimana pola menstruasimu belakangan ini?" options={['Masih teratur', 'Lebih tidak teratur', 'Sudah beberapa bulan tidak menstruasi', 'Tidak yakin', 'Saya tidak ingin menjawab']} value={phaseData.periPola || ''} onChange={(v) => update('periPola', v)} />);
  if (ctx.includes('Menopause')) sections.push(<PhaseQuestion key="meno" label="Sudah berapa lama sejak menstruasi terakhirmu?" options={['<12 bulan', '12–24 bulan', '>2 tahun', 'Tidak yakin', 'Saya tidak ingin menjawab']} value={phaseData.menopauseWaktu || ''} onChange={(v) => update('menopauseWaktu', v)} />);

  if (!sections.length) return null;
  return <div className="mt-4 rounded-2xl bg-sycle-bg border border-sycle-border p-4 space-y-4"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Konteks tambahan</p><p className="text-xs text-sycle-muted mt-1">Semua opsional. Detail ini hanya membantu memilih evidence yang lebih tepat.</p></div>{sections.map((section, index) => <div key={index} className="pb-4 border-b border-sycle-border last:border-0 last:pb-0">{section}</div>)}</div>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 min-h-[calc(100vh-10rem)]"><div className="bg-white rounded-3xl border border-sycle-border p-5 lg:p-7 shadow-sm">{children}</div></div>;
}

export default function Personalization() {
  const navigate = useNavigate();
  const { setPersonalization, isLoggedIn, savedContext, envData, envSource, locationPermission } = useApp();
  const isReturning = isLoggedIn && !!savedContext;
  const [step, setStep] = useState<Step>('intro');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PersonalizationData>({
    ageRange: isReturning ? savedContext?.ageRange || '' : '',
    womenContext: isReturning ? savedContext?.womenContext || [] : [],
    activity: '',
    locationPref: '',
    outdoorDuration: '',
    resources: [],
    phaseData: {},
  });

  const contextHasPhase = data.womenContext.some((value) => PHASE_CONTEXTS.includes(value));
  const contextConflict = CONFLICT_PAIRS.some((pair) => pair.every((value) => data.womenContext.includes(value)));

  const ageOptions = ['Di bawah 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+', 'Saya tidak ingin menjawab'];
  const womenOptions = ['Sedang menstruasi', 'Hamil', 'Pascapersalinan', 'Menyusui', 'Perimenopause', 'Menopause', 'Lainnya', 'Saya tidak ingin menjawab'];
  const activities = ['Bekerja', 'Belajar', 'Perjalanan', 'Aktivitas rumah tangga', 'Merawat orang lain', 'Olahraga', 'Lainnya'];
  const locations = ['Di dalam ruangan', 'Di luar ruangan', 'Keduanya'];
  const durations = ['Tidak berada di luar', '< 1 jam', '1–3 jam', '3–6 jam', '> 6 jam'];
  const resources = ['Air minum', 'Tempat teduh', 'Tempat yang lebih sejuk', 'Waktu istirahat', 'Masker', 'Tidak ada', 'Tidak yakin'];

  const toggleWomenContext = (label: string) => {
    if (label === 'Saya tidak ingin menjawab') {
      setData({ ...data, womenContext: data.womenContext.includes(label) ? [] : [label] });
      return;
    }
    const filtered = data.womenContext.filter((item) => item !== 'Saya tidak ingin menjawab');
    setData({ ...data, womenContext: filtered.includes(label) ? filtered.filter((item) => item !== label) : [...filtered, label] });
  };

  const toggleResource = (resource: string) => setData({ ...data, resources: data.resources.includes(resource) ? data.resources.filter((item) => item !== resource) : [...data.resources, resource] });

  const canContinueContext = Boolean(data.ageRange);
  const canFinish = Boolean(data.activity && data.locationPref && data.outdoorDuration);

  const handleContextNext = () => {
    if (!canContinueContext) return;
    if (contextConflict) {
      setError('Pilih konteks yang konsisten agar informasi yang ditampilkan tetap relevan.');
      return;
    }
    setError(null);
    setStep('today');
  };

  const finish = () => {
    if (!canFinish) return;
    setPersonalization(data);
    navigate('/memproses');
  };

  const phaseSummary = useMemo(() => contextHasPhase ? 'Ada konteks fase yang dapat diperkaya (opsional).' : 'Tidak ada detail fase tambahan yang diperlukan.', [contextHasPhase]);

  if (step === 'intro') {
    return <Shell>
      <div className="w-12 h-12 bg-rose/10 rounded-2xl flex items-center justify-center mb-4"><span className="text-2xl" aria-hidden>✨</span></div>
      <p className="text-xs font-700 uppercase tracking-wide text-rose mb-1">Pahami lebih cepat</p>
      <h1 className="font-800 text-2xl text-sycle-dark mb-2">Kita siapkan konteksmu, lalu langsung ke ringkasan hari ini.</h1>
      <p className="text-sm text-sycle-muted leading-relaxed mb-5">Cukup dua tahap singkat. Setelah itu SYCLE menggabungkan kondisi lingkungan, konteksmu, evidence, catatan tubuh, dan aksi dalam satu halaman.</p>
      <div className="grid sm:grid-cols-3 gap-2 mb-5">
        {['Konteksmu', 'Lingkungan', 'Evidence'].map((label, index) => <div key={label} className="rounded-2xl bg-sycle-bg border border-sycle-border p-3"><div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm mb-2">{index + 1}</div><p className="text-xs font-700 text-sycle-dark">{label}</p><p className="text-[11px] text-sycle-muted mt-1">Bagian penting untuk rekomendasi yang lebih relevan.</p></div>)}
      </div>
      <button onClick={() => setStep(isReturning ? 'context-confirm' : 'context')} className="w-full bg-rose text-white rounded-xl py-3.5 font-700 text-sm hover:bg-rose-dark focus:outline-none focus:ring-2 focus:ring-rose/50">Mulai</button>
      <button onClick={() => navigate(-1)} className="w-full mt-3 text-sycle-muted text-sm py-2">Kembali</button>
    </Shell>;
  }

  if (step === 'context-confirm') {
    return <Shell>
      <p className="text-xs font-700 uppercase tracking-wide text-rose mb-1">Konteks tersimpan</p>
      <h2 className="font-800 text-xl text-sycle-dark mb-2">Masih sesuai untuk hari ini?</h2>
      <p className="text-sm text-sycle-muted mb-5">Kalau iya, kamu cukup mengisi konteks hari ini. Profil tidak perlu diulang.</p>
      <div className="rounded-2xl bg-sycle-bg border border-sycle-border p-4 mb-5 space-y-1"><Row label="Rentang usia" value={savedContext?.ageRange || '—'} /><Row label="Konteks" value={(savedContext?.womenContext || []).filter(Boolean).join(', ') || 'Tidak disebutkan'} /></div>
      <button onClick={() => setStep('today')} className="w-full bg-rose text-white rounded-xl py-3.5 font-700 text-sm mb-2">Ya, lanjutkan</button>
      <button onClick={() => { setData({ ...data, ageRange: '', womenContext: [] }); setStep('context'); }} className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3.5 font-700 text-sm">Perbarui profil</button>
    </Shell>;
  }

  if (step === 'context') {
    return <Shell>
      <div className="flex items-center justify-between gap-3 mb-4"><div><p className="text-xs font-700 uppercase tracking-wide text-rose">Tahap 1 dari 2</p><h2 className="font-800 text-xl text-sycle-dark">Tentang kamu</h2></div><span className="chip chip-sage">1 layar</span></div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <p className="text-sm font-700 text-sycle-dark mb-2">Rentang usia</p>
          <div className="flex flex-wrap gap-2 mb-5">{ageOptions.map((option) => <Chip key={option} label={option} selected={data.ageRange === option} onClick={() => setData({ ...data, ageRange: option })} />)}</div>
          <p className="text-sm font-700 text-sycle-dark mb-2">Konteks yang sesuai saat ini</p>
          <p className="text-xs text-sycle-muted mb-3">Pilih semua yang sesuai. Detail fase tetap opsional.</p>
          <div className="flex flex-wrap gap-2 mb-3">{womenOptions.map((option) => <div key={option} className="flex items-center gap-1"><Chip label={option} selected={data.womenContext.includes(option)} onClick={() => toggleWomenContext(option)} />{['Sedang menstruasi','Hamil','Perimenopause','Menopause'].includes(option) && <InfoButton term={option.toLowerCase().replace('sedang ','').replace(' ','-') as any} />}</div>)}</div>
          <ContextDetails data={data} setData={setData} />
        </div>
        <div className="space-y-4">
          <LocationPermissionCard />
          <div className="rounded-2xl bg-sycle-bg border border-sycle-border p-4"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Kenapa lokasi diperlukan?</p><p className="text-sm text-sycle-dark leading-relaxed">SYCLE menghubungkan kondisi lingkungan aktual dengan konteksmu. Izin browser diperlukan sebelum data lokasi perangkat dipakai.</p><p className="text-[11px] text-sycle-muted mt-2">Status izin: <strong>{locationPermission}</strong></p></div>
          <div className="rounded-2xl bg-powder/50 p-4"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Setelah ini</p><p className="text-sm text-sycle-dark leading-relaxed">Kamu akan memilih aktivitas hari ini. Tidak ada screen tambahan untuk ringkasan dan tindakan.</p></div>
        </div>
      </div>
      {error && <p className="mt-4 rounded-xl bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>}
      <div className="flex gap-3 mt-5"><button onClick={() => setStep('intro')} className="px-5 py-3.5 border border-sycle-border rounded-xl text-sm font-700 text-sycle-dark">Kembali</button><button onClick={handleContextNext} disabled={!canContinueContext} className="flex-1 bg-rose text-white rounded-xl py-3.5 font-700 text-sm disabled:opacity-40">Lanjut ke hari ini</button></div>
    </Shell>;
  }

  return <Shell>
    <div className="flex items-center justify-between gap-3 mb-4"><div><p className="text-xs font-700 uppercase tracking-wide text-rose">Tahap 2 dari 2</p><h2 className="font-800 text-xl text-sycle-dark">Konteks hari ini</h2></div><span className="chip chip-sage">Langsung ke /untukmu</span></div>
    <div className="mb-4"><ContextRelevanceCard data={data} envData={envData} live={envSource === 'live'} /></div>
    <div className="grid lg:grid-cols-2 gap-5">
      <div>
        <p className="text-sm font-700 text-sycle-dark mb-2">Aktivitas utama</p><div className="flex flex-wrap gap-2 mb-4">{activities.map((activity) => <Chip key={activity} label={activity} selected={data.activity === activity} onClick={() => setData({ ...data, activity })} />)}</div>
        <p className="text-sm font-700 text-sycle-dark mb-2">Lebih banyak dilakukan</p><div className="flex flex-wrap gap-2 mb-4">{locations.map((location) => <Chip key={location} label={location} selected={data.locationPref === location} onClick={() => setData({ ...data, locationPref: location })} />)}</div>
        <p className="text-sm font-700 text-sycle-dark mb-2">Durasi di luar hari ini</p><div className="flex flex-wrap gap-2 mb-4">{durations.map((duration) => <Chip key={duration} label={duration} selected={data.outdoorDuration === duration} onClick={() => setData({ ...data, outdoorDuration: duration })} />)}</div>
      </div>
      <div>
        <p className="text-sm font-700 text-sycle-dark mb-2">Yang tersedia untukmu</p><div className="flex flex-wrap gap-2 mb-4">{resources.map((resource) => <Chip key={resource} label={resource} selected={data.resources.includes(resource)} onClick={() => toggleResource(resource)} />)}</div>
        <div className="rounded-2xl bg-sycle-bg border border-sycle-border p-4"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-1">Status konteks</p><p className="text-sm text-sycle-dark">{phaseSummary}</p><p className="text-xs text-sycle-muted mt-2">Pertanyaan tambahan tidak perlu menjadi screen berikutnya.</p></div>
        <div className="mt-4"><LocationPermissionCard compact /></div>
      </div>
    </div>
    <div className="flex gap-3 mt-5"><button onClick={() => setStep('context')} className="px-5 py-3.5 border border-sycle-border rounded-xl text-sm font-700 text-sycle-dark">Kembali</button><button onClick={finish} disabled={!canFinish} className="flex-1 bg-rose text-white rounded-xl py-3.5 font-700 text-sm disabled:opacity-40">Lihat untukmu hari ini</button></div>
  </Shell>;
}
