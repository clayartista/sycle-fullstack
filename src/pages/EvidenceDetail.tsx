"use client";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from '@/lib/navigation';
import EvidenceBadge from '../components/EvidenceBadge';
import type { EvidenceBadgeType } from '../types';
import type { EvidenceTopicPayload } from '../lib/evidence/types';

type Param = { topic?: string | string[] };

function strengthToBadge(strength: string): EvidenceBadgeType {
  if (strength === 'high') return 'kuat';
  if (strength === 'moderate') return 'terbatas';
  if (strength === 'low') return 'belum-cukup';
  return 'berbeda';
}

const DEMO_FALLBACK: Record<string, EvidenceTopicPayload> = {
  'panas-kehamilan': {
    topic: { id:'demo-heat', slug:'panas-kehamilan', name:'Panas & Kehamilan', description:'Paparan panas dan konteks kehamilan.', whyRelevant:'Lingkungan panas menjadi bagian dari konteks pengalaman harian.', category:'environment-reproductive-health', defaultActions:['Cari tempat lebih sejuk','Minum secara teratur','Kurangi aktivitas berat saat sangat panas'] },
    results: [], sources: [], claims: [],
  },
  'pm25-kehamilan': {
    topic: { id:'demo-pm', slug:'pm25-kehamilan', name:'PM2.5 & Kehamilan', description:'Partikel udara halus dan konteks kehamilan.', whyRelevant:'Kualitas udara dapat menjadi konteks penting untuk aktivitas harian.', category:'environment-reproductive-health', defaultActions:['Pantau kualitas udara','Kurangi aktivitas berat di luar saat kualitas udara buruk','Perhatikan ventilasi'] },
    results: [], sources: [], claims: [],
  },
  'kelembapan-kehamilan': {
    topic: { id:'demo-humidity', slug:'kelembapan-kehamilan', name:'Kelembapan & Kehamilan', description:'Kelembapan dan beban panas lingkungan.', whyRelevant:'Kelembapan tinggi dapat menjadi bagian dari konteks panas yang dirasakan.', category:'environment-reproductive-health', defaultActions:['Cari tempat yang lebih sejuk','Istirahat saat tubuh terasa tidak nyaman','Pantau kombinasi panas dan kelembapan'] },
    results: [], sources: [], claims: [],
  },
};

export default function EvidenceDetail() {
  const params = useParams<Param>();
  const topic = Array.isArray(params?.topic) ? params.topic[0] : params?.topic;
  const navigate = useNavigate();
  const [payload, setPayload] = useState<EvidenceTopicPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResearch, setShowResearch] = useState(false);

  useEffect(() => {
    if (!topic) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/evidence/${encodeURIComponent(topic)}`, { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled) setPayload(response.ok ? data : DEMO_FALLBACK[topic] || null);
      } catch {
        if (!cancelled) setPayload(DEMO_FALLBACK[topic] || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [topic]);

  const known = useMemo(() => (payload?.claims || []).map(c => c.summary || c.claim).filter(Boolean).slice(0, 4), [payload]);
  const limitations = useMemo(() => Array.from(new Set((payload?.claims || []).flatMap(c => c.limitations))).slice(0, 4), [payload]);
  const actions = useMemo(() => Array.from(new Set([...(payload?.topic.defaultActions || []), ...(payload?.claims || []).flatMap(c => c.actionSuggestions)])).slice(0, 5), [payload]);
  const badge = strengthToBadge(payload?.claims?.[0]?.evidenceStrength || 'unclear');

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><div className="bg-white border border-sycle-border rounded-3xl p-6 animate-pulse"><div className="h-5 bg-blush rounded w-32"/><div className="h-8 bg-blush rounded w-64 mt-3"/><div className="h-24 bg-sycle-bg rounded-2xl mt-6"/></div></div>;
  if (!payload) return <div className="max-w-2xl mx-auto px-4 py-10"><div className="bg-blush rounded-2xl p-5">Topik evidence belum tersedia.</div></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sycle-muted text-sm font-500 mb-5 hover:text-rose"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>Kembali</button>
      <div className="mb-6"><EvidenceBadge badge={badge} className="mb-3"/><h1 className="font-800 text-2xl text-sycle-dark">{payload.topic.name}</h1><p className="text-sm text-sycle-muted mt-2">{payload.topic.whyRelevant}</p></div>
      <div className="space-y-4">
        <Section title="APA YANG DIMAKSUD?" bg="bg-white"><p className="text-sm text-sycle-dark leading-relaxed">{payload.topic.description}</p></Section>
        <Section title="APA YANG SUDAH DIKETAHUI?" bg="bg-sage/20">{known.length ? <ul className="space-y-2">{known.map((item,i)=><li key={i} className="text-sm leading-relaxed flex gap-2"><span>•</span><span>{item}</span></li>)}</ul> : <p className="text-sm text-sycle-muted">Belum ada claim yang disetujui. Knowledge base masih dalam proses kurasi.</p>}</Section>
        <Section title="APA YANG BELUM DIKETAHUI?" bg="bg-lavender/20">{limitations.length ? <ul className="space-y-2">{limitations.map((item,i)=><li key={i} className="text-sm leading-relaxed flex gap-2"><span>○</span><span>{item}</span></li>)}</ul> : <p className="text-sm text-sycle-muted">Batasan evidence akan tampil setelah reviewer mengisi claim dan limitations.</p>}</Section>
        <Section title="APA YANG BISA DILAKUKAN?" bg="bg-powder/30"><ul className="space-y-2">{actions.map((item,i)=><li key={i} className="text-sm leading-relaxed flex gap-2"><span>→</span><span>{item}</span></li>)}</ul><button onClick={()=>navigate('/untukmu')} className="w-full bg-rose text-white rounded-xl py-2.5 font-600 text-sm mt-4">Kembali ke Untukmu Hari Ini</button></Section>
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-sycle-border p-4">
        <div className="flex items-center justify-between"><div><p className="text-sm font-700 text-sycle-dark">Evidence yang dipakai</p><p className="text-xs text-sycle-muted mt-1">Hanya source yang sudah published + verified yang masuk retrieval user.</p></div><span className="chip chip-sage">{payload.results.length || payload.sources.length} sumber</span></div>
        <button onClick={()=>setShowResearch(!showResearch)} className="mt-4 text-rose font-700 text-sm">{showResearch ? 'Tutup sumber' : 'Lihat citation & sumber'} ↗</button>
        {showResearch && <div className="mt-3 space-y-2">{(payload.results.length ? payload.results : payload.sources.map(s=>({citation:s} as any))).map((item:any, i:number)=><div key={item.citation?.sourceId || i} className="rounded-xl border border-sycle-border px-3 py-3"><div className="text-sm font-600">{item.citation?.sourceTitle}</div><div className="text-xs text-sycle-muted mt-1">{item.citation?.authors || 'Penulis belum diisi'}{item.citation?.publicationYear ? ` · ${item.citation.publicationYear}` : ''}{item.pageNumber ? ` · hlm. ${item.pageNumber}` : ''}</div>{item.citation?.doi && <div className="text-xs text-rose mt-1">DOI: {item.citation.doi}</div>}</div>)}</div>}
      </div>

      <div className="mt-6"><button onClick={()=>navigate('/untukmu')} className="w-full border border-sycle-border text-sycle-dark rounded-xl py-3.5 font-600 text-sm hover:bg-blush">Kembali ke Untukmu Hari Ini</button></div>
      <p className="text-xs text-sycle-muted mt-5 leading-relaxed">SYCLE menggunakan curated evidence untuk membantu memahami konteks, bukan untuk menetapkan diagnosis atau menentukan apa yang dialami seseorang.</p>
    </div>
  );
}

function Section({ title, bg, children }: { title: string; bg: string; children: React.ReactNode }) {
  return <div className={`${bg} rounded-2xl border border-sycle-border p-5`}><p className="text-xs font-700 text-sycle-muted uppercase tracking-wider mb-3">{title}</p>{children}</div>;
}
