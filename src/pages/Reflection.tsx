"use client";
import { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useApp } from '../context/AppContext';
import type { ReflectionData, SymptomDetail } from '../types';
import { CONTEXT_SYMPTOMS, DEFAULT_SYMPTOMS, SCALE_LABELS } from '../types';

type ReflectionStep = 'prompt' | 'symptoms' | 'member-detail' | 'story' | 'ai-review';

const ONSET_OPTIONS = ['Hari ini', 'Kemarin', '2–7 hari lalu', '>1 minggu', 'Tidak yakin'];
const DURATION_OPTIONS = ['<1 jam', '1–3 jam', '>3 jam', 'Hilang-timbul', 'Hampir sepanjang hari'];
const CHANGE_OPTIONS = ['Lebih ringan', 'Kurang lebih sama', 'Lebih kuat', 'Baru pertama terasa', 'Tidak yakin'];
const ACTIVITY_IMPACT_OPTIONS = ['Tidak mengganggu', 'Sedikit', 'Cukup', 'Sangat mengganggu'];
const CARE_SEEKING_OPTIONS = ['Belum', 'Sudah menghubungi tenaga kesehatan', 'Sudah berkunjung', 'Saya tidak ingin menjawab'];

const BLEEDING_OPTIONS = ['Tidak ada', 'Sedikit', 'Sedang', 'Banyak', 'Lebih banyak dari biasanya', 'Tidak yakin'];
const FEEDING_PATTERN_OPTIONS = ['Tidak', 'Lebih sering', 'Lebih jarang', 'Tidak yakin'];

function getSymptomList(womenContext: string[]): string[] {
  const symptoms: string[] = [];
  const seen = new Set<string>();
  for (const ctx of womenContext) {
    const list = CONTEXT_SYMPTOMS[ctx] || [];
    for (const s of list) {
      if (!seen.has(s)) { seen.add(s); symptoms.push(s); }
    }
  }
  if (symptoms.length === 0) {
    for (const s of DEFAULT_SYMPTOMS) {
      if (!seen.has(s)) { seen.add(s); symptoms.push(s); }
    }
  }
  return symptoms;
}

function ScaleButton({ value, current, onClick }: { value: number; current: number; onClick: () => void }) {
  const active = current === value;
  const activeColors = ['bg-sycle-bg border-sycle-border text-sycle-muted', 'bg-powder border-powder text-blue-700', 'bg-lavender border-lavender text-purple-700', 'bg-blush border-blush text-rose', 'bg-rose border-rose text-white'];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded-xl text-sm font-700 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-rose/50 ${
        active ? activeColors[value] + ' scale-110 shadow-sm' : 'bg-white border-sycle-border text-sycle-muted hover:border-rose/30'
      }`}
      aria-pressed={active}
      title={SCALE_LABELS[value]}
    >
      {value}
    </button>
  );
}

function SymptomRow({ symptom, scale, onChange }: { symptom: string; scale: number; onChange: (v: number) => void }) {
  return (
    <div className="py-3 border-b border-sycle-border last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-500 text-sycle-dark flex-1 leading-snug">{symptom}</span>
        <div className="flex gap-1.5 flex-shrink-0">
          {[0, 1, 2, 3, 4].map(v => (
            <ScaleButton key={v} value={v} current={scale} onClick={() => onChange(v)} />
          ))}
        </div>
      </div>
      {scale > 0 && (
        <p className="text-xs text-sycle-muted mt-1">{SCALE_LABELS[scale]}</p>
      )}
    </div>
  );
}

function CategoricalChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-600 border transition-all focus:outline-none focus:ring-2 focus:ring-rose/50 ${
        selected ? 'bg-rose text-white border-rose' : 'bg-white border-sycle-border text-sycle-dark hover:border-rose/40'
      }`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export default function Reflection() {
  const navigate = useNavigate();
  const { setReflection, personalization, isLoggedIn } = useApp();
  const [step, setStep] = useState<ReflectionStep>('prompt');
  const [symptomScales, setSymptomScales] = useState<Record<string, number>>({});
  const [symptomDetails, setSymptomDetails] = useState<Record<string, SymptomDetail>>({});
  const [bleeding, setBleeding] = useState('');
  const [feedingPattern, setFeedingPattern] = useState('');
  const [story, setStory] = useState('');
  const [aiStory, setAiStory] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);

  const womenContext = personalization?.womenContext || [];
  const symptomList = getSymptomList(womenContext);
  const isPostpartum = womenContext.includes('Pascapersalinan');
  const isBreastfeeding = womenContext.includes('Menyusui');
  const hasRated = Object.values(symptomScales).some(v => v > 0) || !!bleeding || !!feedingPattern;
  const ratedSymptoms = symptomList.filter(s => (symptomScales[s] ?? 0) > 0);

  const updateDetail = (symptom: string, field: keyof SymptomDetail, value: string) => {
    setSymptomDetails(prev => ({
      ...prev,
      [symptom]: { ...prev[symptom], [field]: value },
    }));
  };

  const handleAfterSymptoms = () => {
    if (isLoggedIn && ratedSymptoms.length > 0) {
      setStep('member-detail');
    } else {
      setStep('story');
    }
  };

  const setScale = (symptom: string, value: number) =>
    setSymptomScales(prev => ({ ...prev, [symptom]: value }));

  const handleSaveSymptoms = () => handleAfterSymptoms();

  const handleAIOrganize = () => {
    setAiProcessing(true);
    setTimeout(() => {
      const rated = Object.entries(symptomScales).filter(([, v]) => v > 0);
      const symDesc = rated.map(([s, v]) => `${s} (${SCALE_LABELS[v]})`).join(', ');
      const bleedDesc = bleeding ? ` Pendarahan: ${bleeding}.` : '';
      const base = symDesc ? `${symDesc}.${bleedDesc} ` : bleedDesc ? `${bleedDesc} ` : '';
      setAiStory(`${base}${story}`.trim());
      setAiProcessing(false);
      setStep('ai-review');
    }, 1800);
  };

  const handleSave = (finalStory: string, usedAi: boolean) => {
    const data: ReflectionData = {
      symptomScales,
      ...(isLoggedIn && Object.keys(symptomDetails).length > 0 ? { symptomDetails } : {}),
      ...(isPostpartum && bleeding ? { bleeding } : {}),
      ...(isBreastfeeding && feedingPattern ? { feedingPattern } : {}),
      story: finalStory,
      usedAi,
      ...(usedAi ? { aiStory: finalStory } : {}),
    };
    setReflection(data);
    navigate('/untukmu');
  };

  if (step === 'prompt') {
    return (
      <Screen title="Ingin mencatat kondisimu hari ini?">
        <div className="space-y-3">
          <button
            onClick={() => setStep('symptoms')}
            className="w-full text-left bg-white border border-sycle-border rounded-2xl p-4 hover:border-rose/40 hover:bg-blush/30 transition-all focus:outline-none focus:ring-2 focus:ring-rose/50"
          >
            <p className="font-600 text-sm text-sycle-dark">Ada yang ingin saya catat</p>
            <p className="text-xs text-sycle-muted mt-0.5">Catat apa yang kamu rasakan hari ini</p>
          </button>
          <button
            onClick={() => { setReflection(null); navigate('/untukmu'); }}
            className="w-full text-left bg-white border border-sycle-border rounded-2xl p-4 hover:border-rose/40 hover:bg-blush/30 transition-all focus:outline-none focus:ring-2 focus:ring-rose/50"
          >
            <p className="font-600 text-sm text-sycle-dark">Tidak ada yang ingin dicatat</p>
            <p className="text-xs text-sycle-muted mt-0.5">Tidak ada yang perlu dicatat hari ini</p>
          </button>
          <button
            onClick={() => navigate('/untukmu')}
            className="w-full text-sycle-muted text-sm font-600 py-3 hover:text-sycle-dark transition-colors focus:outline-none"
          >
            Lewati
          </button>
        </div>
      </Screen>
    );
  }

  if (step === 'symptoms') {
    return (
      <Screen title="Apa yang kamu rasakan?">
        <div className="bg-powder/60 rounded-xl px-4 py-2.5 mb-5">
          <p className="text-xs text-sycle-muted leading-relaxed">
            Skala ini menggambarkan apa yang kamu rasakan, bukan tingkat risiko kesehatan.
          </p>
        </div>

        {/* Scale legend */}
        <div className="flex items-center justify-end gap-1.5 mb-3 pr-0.5">
          <span className="flex-1 text-xs text-sycle-muted">Gejala</span>
          {[0, 1, 2, 3, 4].map(v => (
            <div key={v} className="w-10 text-center text-xs text-sycle-muted font-600" title={SCALE_LABELS[v]}>{v}</div>
          ))}
        </div>

        {symptomList.map(s => (
          <SymptomRow
            key={s}
            symptom={s}
            scale={symptomScales[s] ?? 0}
            onChange={v => setScale(s, v)}
          />
        ))}

        {/* Postpartum bleeding — categorical only (spec §38) */}
        {isPostpartum && (
          <div className="mt-5 pt-5 border-t border-sycle-border">
            <p className="text-sm font-600 text-sycle-dark mb-3">Pendarahan saat ini:</p>
            <div className="flex flex-wrap gap-2">
              {BLEEDING_OPTIONS.map(opt => (
                <CategoricalChip
                  key={opt}
                  label={opt}
                  selected={bleeding === opt}
                  onClick={() => setBleeding(bleeding === opt ? '' : opt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Breastfeeding feeding pattern — optional (spec §39) */}
        {isBreastfeeding && (
          <div className="mt-5 pt-5 border-t border-sycle-border">
            <p className="text-sm font-600 text-sycle-dark mb-1">Apakah pola menyusu terasa berbeda dari biasanya?</p>
            <p className="text-xs text-sycle-muted mb-3">Opsional</p>
            <div className="flex flex-wrap gap-2">
              {FEEDING_PATTERN_OPTIONS.map(opt => (
                <CategoricalChip
                  key={opt}
                  label={opt}
                  selected={feedingPattern === opt}
                  onClick={() => setFeedingPattern(feedingPattern === opt ? '' : opt)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 text-xs text-sycle-muted mt-5 mb-6 bg-sycle-bg rounded-xl px-3 py-2 border border-sycle-border">
          {[0, 1, 2, 3, 4].map(v => (
            <span key={v}><strong>{v}</strong> = {SCALE_LABELS[v]}{v < 4 ? ' · ' : ''}</span>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep('prompt')} className="px-6 py-3.5 border border-sycle-border rounded-xl font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Kembali</button>
          <button onClick={handleSaveSymptoms} className="flex-1 bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Lanjut</button>
        </div>
        {!hasRated && (
          <button onClick={() => setStep('story')} className="w-full mt-3 text-sycle-muted text-sm font-600 py-2 hover:text-sycle-dark transition-colors focus:outline-none">
            Lewati dan tulis cerita saja
          </button>
        )}
      </Screen>
    );
  }

  if (step === 'member-detail') {
    return (
      <Screen title="Detail Keluhan Hari Ini">
        <div className="bg-powder/60 rounded-xl px-4 py-2.5 mb-5">
          <p className="text-xs text-sycle-muted leading-relaxed">
            Pertanyaan berikut membantu catatan Health Tracker-mu lebih lengkap. Semua boleh dilewati.
          </p>
        </div>
        <div className="space-y-6">
          {ratedSymptoms.map(symptom => {
            const detail = symptomDetails[symptom] || {};
            return (
              <div key={symptom} className="bg-sycle-bg rounded-2xl border border-sycle-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-700 text-sm text-sycle-dark">{symptom}</p>
                  <span className="text-xs font-600 text-sycle-muted bg-blush px-2 py-0.5 rounded-full">
                    {symptomScales[symptom]} / 4 — {SCALE_LABELS[symptomScales[symptom]]}
                  </span>
                </div>
                <DetailQuestion
                  label="Kapan mulai dirasakan?"
                  options={ONSET_OPTIONS}
                  selected={detail.onset}
                  onSelect={v => updateDetail(symptom, 'onset', v)}
                />
                <DetailQuestion
                  label="Berapa lama terasa hari ini?"
                  options={DURATION_OPTIONS}
                  selected={detail.duration}
                  onSelect={v => updateDetail(symptom, 'duration', v)}
                />
                <DetailQuestion
                  label="Dibanding biasanya, bagaimana rasanya?"
                  options={CHANGE_OPTIONS}
                  selected={detail.change}
                  onSelect={v => updateDetail(symptom, 'change', v)}
                />
                <DetailQuestion
                  label="Seberapa mengganggu aktivitasmu?"
                  options={ACTIVITY_IMPACT_OPTIONS}
                  selected={detail.activityImpact}
                  onSelect={v => updateDetail(symptom, 'activityImpact', v)}
                />
                <div className="mt-3">
                  <p className="text-xs font-600 text-sycle-muted mb-1.5">Ada hal yang sudah kamu lakukan? <span className="font-400">Opsional</span></p>
                  <input
                    type="text"
                    value={detail.careAction || ''}
                    onChange={e => updateDetail(symptom, 'careAction', e.target.value)}
                    placeholder="Misal: minum air, istirahat..."
                    className="w-full bg-white border border-sycle-border rounded-xl px-3 py-2 text-sm text-sycle-dark placeholder:text-sycle-muted focus:outline-none focus:ring-2 focus:ring-rose/40 mb-3"
                  />
                  <DetailQuestion
                    label="Apakah kamu ingin mencatat bantuan kesehatan yang sudah dicari?"
                    options={CARE_SEEKING_OPTIONS}
                    selected={detail.careSeeking}
                    onSelect={v => updateDetail(symptom, 'careSeeking', v)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-sycle-muted mt-4 mb-5 text-center">
          Pertanyaan ini tidak membuat SYCLE menjadi alat klinis. Ini adalah catatan pribadi kamu.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setStep('symptoms')} className="px-6 py-3.5 border border-sycle-border rounded-xl font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Kembali</button>
          <button onClick={() => setStep('story')} className="flex-1 bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Lanjut</button>
        </div>
      </Screen>
    );
  }

  if (step === 'story') {
    return (
      <Screen title="Ceritakan dengan bahasamu sendiri">
        <p className="text-sm text-sycle-muted mb-1 font-600">Ada hal lain tentang tubuhmu atau harimu yang ingin kamu catat?</p>
        <label htmlFor="story-input" className="block text-xs text-sycle-muted mb-3">
          Kamu tidak harus tahu penyebabnya. Ceritakan saja apa yang kamu alami.
        </label>
        <textarea
          id="story-input"
          value={story}
          onChange={e => setStory(e.target.value)}
          placeholder="Hari ini saya..."
          rows={5}
          className="w-full bg-white border border-sycle-border rounded-2xl px-4 py-3 text-sm text-sycle-dark placeholder:text-sycle-muted focus:outline-none focus:ring-2 focus:ring-rose/40 resize-none mb-5 transition-all"
        />
        <div className="flex gap-3 mb-3">
          <button
            onClick={handleAIOrganize}
            disabled={!story.trim() || aiProcessing}
            className="flex-1 bg-lavender border border-lavender text-purple-800 rounded-xl py-3.5 font-600 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 focus:outline-none"
          >
            {aiProcessing ? 'Memproses...' : 'Bantu Rapikan dengan AI'}
          </button>
          <button
            onClick={() => handleSave(story, false)}
            disabled={!story.trim()}
            className="flex-1 bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors disabled:opacity-40 focus:outline-none"
          >
            {isLoggedIn ? 'Simpan Apa Adanya' : 'Gunakan Cerita Ini'}
          </button>
        </div>
        {hasRated && !story.trim() && (
          <button
            onClick={() => handleSave('', false)}
            className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3 font-600 text-sm hover:bg-blush transition-colors focus:outline-none mb-2"
          >
            Simpan tanpa cerita
          </button>
        )}
        <button
          onClick={() => setStep(isLoggedIn && ratedSymptoms.length > 0 ? 'member-detail' : 'symptoms')}
          className="w-full mt-1 text-sycle-muted text-sm font-600 py-2 hover:text-sycle-dark transition-colors focus:outline-none"
        >
          Kembali
        </button>
      </Screen>
    );
  }

  if (step === 'ai-review') {
    return (
      <Screen title="Apakah ringkasan ini sesuai?">
        <div className="bg-lavender/30 rounded-2xl border border-lavender p-4 mb-4">
          <p className="text-sm text-sycle-dark leading-relaxed italic">"{aiStory}"</p>
        </div>
        <div className="bg-powder/60 rounded-xl px-4 py-2.5 mb-6">
          <p className="text-xs text-sycle-muted leading-relaxed">
            AI hanya membantu merapikan cerita yang kamu tulis. Tidak ada interpretasi medis yang ditambahkan.
          </p>
        </div>
        <div className="space-y-2">
          <button onClick={() => handleSave(aiStory, true)} className="w-full bg-rose text-white rounded-xl py-3.5 font-600 text-sm hover:bg-rose-dark transition-colors focus:outline-none">Ya, sesuai</button>
          <button onClick={() => setStep('story')} className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3.5 font-600 text-sm hover:bg-blush transition-colors focus:outline-none">Edit sendiri</button>
          <button onClick={() => handleSave(story, false)} className="w-full text-sycle-muted text-sm font-600 py-2 hover:text-sycle-dark transition-colors focus:outline-none">Gunakan cerita asli</button>
        </div>
      </Screen>
    );
  }

  return null;
}

function DetailQuestion({ label, options, selected, onSelect }: {
  label: string; options: string[]; selected?: string; onSelect: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="text-xs font-600 text-sycle-muted mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(selected === opt ? '' : opt)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-600 border transition-all focus:outline-none ${
              selected === opt ? 'bg-rose text-white border-rose' : 'bg-white border-sycle-border text-sycle-dark hover:border-rose/40'
            }`}
            aria-pressed={selected === opt}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Screen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 min-h-[calc(100vh-10rem)] flex flex-col justify-center">
      <div className="bg-white rounded-2xl border border-sycle-border p-6 shadow-sm">
        <h2 className="font-700 text-xl text-sycle-dark mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}
