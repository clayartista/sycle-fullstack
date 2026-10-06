"use client";

import { useEffect, useState } from 'react';

interface Topic { id: string; slug: string; name: string; status: string; }
interface Source { id: string; title: string; source_type: string; publication_year?: number; verified: boolean; status: string; }
interface Job { id: string; source_id: string; status: string; progress: number; error_message?: string | null; }

export default function KnowledgeAdmin() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', authors: '', publicationYear: '', topicId: '', doi: '', url: '', evidenceLevel: 'moderate', sourceType: 'research' });
  const [file, setFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState('');
  const [claimForm, setClaimForm] = useState({ claim:'', summary:'', evidenceStrength:'moderate', limitations:'', actions:'', citationText:'', page:'' });
  const [claims, setClaims] = useState<any[]>([]);

  const load = async () => {
    const response = await fetch('/api/admin/knowledge', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Akses admin diperlukan.'); return; }
    setTopics(data.topics || []); setSources(data.sources || []); setJobs(data.jobs || []);
    if (!form.topicId && data.topics?.[0]) setForm((prev) => ({ ...prev, topicId: data.topics[0].id }));
  };

  useEffect(() => { void load(); }, []);

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) { setMessage('Pilih PDF penelitian terlebih dahulu.'); return; }
    const body = new FormData();
    body.set('file', file);
    body.set('metadata', JSON.stringify({ ...form, publicationYear: form.publicationYear ? Number(form.publicationYear) : undefined }));
    const response = await fetch('/api/admin/knowledge/upload', { method: 'POST', body });
    const data = await response.json();
    setMessage(response.ok ? `Source dibuat. Job ingestion: ${data.job?.id}` : (data.error || 'Upload gagal.'));
    if (response.ok) { setFile(null); await load(); }
  };

  const addClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    const topic = topics.find((item) => item.id === (form.topicId || topics[0]?.id)) || topics[0];
    if (!selectedSource || !topic) { setMessage('Pilih source dan pastikan topic tersedia.'); return; }
    const response = await fetch('/api/admin/knowledge/claims', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sourceId:selectedSource, topicId:topic.id, claim:claimForm.claim, summary:claimForm.summary, evidenceStrength:claimForm.evidenceStrength, limitations:claimForm.limitations.split('\n').map(v=>v.trim()).filter(Boolean), actionSuggestions:claimForm.actions.split('\n').map(v=>v.trim()).filter(Boolean), reviewStatus:'draft', citationText:claimForm.citationText || undefined, page:claimForm.page ? Number(claimForm.page) : undefined }) });
    const data = await response.json();
    setMessage(response.ok ? 'Claim draft disimpan.' : (data.error || 'Claim gagal disimpan.'));
    if (response.ok) { setClaimForm({claim:'',summary:'',evidenceStrength:'moderate',limitations:'',actions:'',citationText:'',page:''}); await loadClaims(selectedSource); }
  };

  const loadClaims = async (sourceId:string) => {
    if (!sourceId) { setClaims([]); return; }
    const response = await fetch(`/api/admin/knowledge/claims?sourceId=${sourceId}`, { cache:'no-store' });
    const data = await response.json();
    if (response.ok) setClaims(data.claims || []);
  };

  const approveClaim = async (id:string) => {
    const response = await fetch(`/api/admin/knowledge/claims/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reviewStatus:'approved' }) });
    const data = await response.json();
    setMessage(response.ok ? 'Claim approved.' : (data.error || 'Gagal approve claim.'));
    await loadClaims(selectedSource);
  };

  const publish = async (source: Source) => {
    const response = await fetch(`/api/admin/knowledge/sources/${source.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published', verified: true }),
    });
    const data = await response.json();
    setMessage(response.ok ? 'Source dipublikasikan.' : data.error || 'Gagal mempublikasikan.');
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header>
        <div className="chip chip-lavender mb-2">SYCLE Knowledge Base</div>
        <h1 className="text-2xl sm:text-3xl font-800 text-sycle-dark">Evidence RAG</h1>
        <p className="text-sm text-sycle-muted mt-2 max-w-3xl">Upload sumber penelitian, kaitkan ke topik, jalankan ingestion PDF → chunk → embedding, lalu review sebelum evidence tampil ke pengguna.</p>
      </header>

      {message && <div className="bg-blush border border-sycle-border rounded-2xl px-4 py-3 text-sm text-sycle-dark">{message}</div>}

      <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
        <form onSubmit={upload} className="bg-white border border-sycle-border rounded-3xl p-5 space-y-4">
          <div><p className="text-xs font-700 text-sycle-muted uppercase tracking-wide">Tambah evidence source</p><h2 className="font-800 text-lg mt-1">Upload artikel / guideline</h2></div>
          <input className="w-full border border-sycle-border rounded-xl px-3 py-2.5" placeholder="Judul sumber" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <input className="w-full border border-sycle-border rounded-xl px-3 py-2.5" placeholder="Penulis" value={form.authors} onChange={e=>setForm({...form,authors:e.target.value})}/>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="w-full border border-sycle-border rounded-xl px-3 py-2.5" type="number" placeholder="Tahun" value={form.publicationYear} onChange={e=>setForm({...form,publicationYear:e.target.value})}/>
            <select className="w-full border border-sycle-border rounded-xl px-3 py-2.5" value={form.topicId} onChange={e=>setForm({...form,topicId:e.target.value})}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="w-full border border-sycle-border rounded-xl px-3 py-2.5" placeholder="DOI (opsional)" value={form.doi} onChange={e=>setForm({...form,doi:e.target.value})}/>
            <select className="w-full border border-sycle-border rounded-xl px-3 py-2.5" value={form.evidenceLevel} onChange={e=>setForm({...form,evidenceLevel:e.target.value})}><option>high</option><option>moderate</option><option>low</option><option>unclear</option></select>
          </div>
          <input className="w-full border border-sycle-border rounded-xl px-3 py-2.5" placeholder="URL resmi (opsional)" value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/>
          <input className="w-full border border-sycle-border rounded-xl px-3 py-2.5 bg-sycle-bg" type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)}/>
          <button className="btn-primary w-full" type="submit">Simpan & antrekan ingestion</button>
          <p className="text-xs text-sycle-muted">Source baru selalu masuk sebagai <strong>draft</strong>. Publikasi hanya dilakukan setelah klaim, citation, dan kualitas evidence direview.</p>
        </form>

        <div className="space-y-5">
          <div className="bg-sage/50 border border-sycle-border rounded-3xl p-5"><p className="text-xs uppercase tracking-wide font-700 text-sycle-muted">Pipeline</p><div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs font-600 text-sycle-dark"><span className="bg-white rounded-xl p-3">PDF</span><span>→</span><span className="bg-white rounded-xl p-3">Chunk</span><span>→</span><span className="bg-white rounded-xl p-3">Embedding</span></div><p className="text-xs text-sycle-muted mt-3">CLI worker menggunakan source file private dan service role; user hanya menerima evidence yang sudah published + verified.</p></div>
          <div className="bg-white border border-sycle-border rounded-3xl p-5"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Topics</p><div className="mt-3 space-y-2">{topics.map(t=><div key={t.id} className="flex justify-between items-center px-3 py-2 rounded-xl bg-sycle-bg"><span className="text-sm font-600">{t.name}</span><span className="chip chip-sage">{t.status}</span></div>)}</div></div>
        </div>
      </section>

      <section className="bg-white border border-sycle-border rounded-3xl p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Claims</p><h2 className="font-800 text-lg">Kurasi claim sebelum publish</h2></div></div>
        <form onSubmit={addClaim} className="mt-4 grid md:grid-cols-2 gap-3">
          <select className="border border-sycle-border rounded-xl px-3 py-2.5" value={selectedSource} onChange={e=>setSelectedSource(e.target.value)}><option value="">Pilih source</option>{sources.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
          <select className="border border-sycle-border rounded-xl px-3 py-2.5" value={claimForm.evidenceStrength} onChange={e=>setClaimForm({...claimForm,evidenceStrength:e.target.value})}><option>high</option><option>moderate</option><option>low</option><option>unclear</option></select>
          <textarea className="md:col-span-2 border border-sycle-border rounded-xl px-3 py-2.5 min-h-24" placeholder="Claim yang ditopang sumber (bukan interpretasi bebas AI)" value={claimForm.claim} onChange={e=>setClaimForm({...claimForm,claim:e.target.value})}/>
          <textarea className="md:col-span-2 border border-sycle-border rounded-xl px-3 py-2.5 min-h-20" placeholder="Ringkasan bahasa pengguna" value={claimForm.summary} onChange={e=>setClaimForm({...claimForm,summary:e.target.value})}/>
          <textarea className="border border-sycle-border rounded-xl px-3 py-2.5 min-h-20" placeholder="Limitations, satu per baris" value={claimForm.limitations} onChange={e=>setClaimForm({...claimForm,limitations:e.target.value})}/>
          <textarea className="border border-sycle-border rounded-xl px-3 py-2.5 min-h-20" placeholder="Action suggestions, satu per baris" value={claimForm.actions} onChange={e=>setClaimForm({...claimForm,actions:e.target.value})}/>
          <input className="border border-sycle-border rounded-xl px-3 py-2.5" placeholder="Citation text" value={claimForm.citationText} onChange={e=>setClaimForm({...claimForm,citationText:e.target.value})}/>
          <input className="border border-sycle-border rounded-xl px-3 py-2.5" type="number" placeholder="Halaman" value={claimForm.page} onChange={e=>setClaimForm({...claimForm,page:e.target.value})}/>
          <button className="btn-primary md:col-span-2" type="submit">Simpan claim sebagai draft</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">{sources.slice(0,8).map(s=><button key={s.id} onClick={async()=>{setSelectedSource(s.id); await loadClaims(s.id); setMessage(`${s.title} dipilih.`);}} className="chip chip-lavender">{s.title}</button>)}</div>
        {selectedSource && claims.length > 0 && <div className="mt-4 space-y-2">{claims.map((claim:any)=><div key={claim.id} className="border border-sycle-border rounded-2xl px-3 py-3"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-700">{claim.summary}</div><div className="text-xs text-sycle-muted mt-1">{claim.claim}</div></div><span className="chip chip-lavender">{claim.review_status}</span></div>{claim.review_status !== 'approved' && <button onClick={()=>void approveClaim(claim.id)} className="mt-2 text-xs text-rose font-700">Approve claim</button>}</div>)}</div>}
        <p className="text-xs text-sycle-muted mt-3">Claim hanya menjadi user-facing setelah <strong>approved</strong> dan source <strong>published + verified</strong>.</p>
      </section>

      <section className="bg-white border border-sycle-border rounded-3xl p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Sources</p><h2 className="font-800 text-lg">Review queue</h2></div><button onClick={()=>void load()} className="btn-secondary text-sm">Refresh</button></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-sycle-muted border-b border-sycle-border"><th className="py-3 pr-3">Source</th><th className="py-3 pr-3">Tahun</th><th className="py-3 pr-3">Status</th><th className="py-3">Aksi</th></tr></thead><tbody>{sources.map(source=><tr key={source.id} className="border-b border-sycle-border/70"><td className="py-3 pr-3"><div className="font-600">{source.title}</div><div className="text-xs text-sycle-muted">{source.source_type}</div></td><td className="py-3 pr-3">{source.publication_year || '—'}</td><td className="py-3 pr-3"><span className={source.verified && source.status==='published' ? 'chip chip-sage' : 'chip chip-blush'}>{source.status}{source.verified ? ' · verified' : ''}</span></td><td className="py-3">{source.status !== 'published' ? <button onClick={()=>void publish(source)} className="text-rose font-700">Publish</button> : <span className="text-sycle-muted">Published</span>}</td></tr>)}</tbody></table></div>
      </section>

      <section className="bg-white border border-sycle-border rounded-3xl p-5"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted">Ingestion jobs</p><div className="mt-3 space-y-2">{jobs.map(job=><div key={job.id} className="flex items-center justify-between gap-4 bg-sycle-bg rounded-xl px-3 py-3 text-sm"><div><div className="font-600">{job.id.slice(0,8)}</div>{job.error_message && <div className="text-xs text-rose mt-1">{job.error_message}</div>}</div><div className="text-right"><div className="font-700">{job.status}</div><div className="text-xs text-sycle-muted">{job.progress}%</div></div></div>)}</div></section>
    </div>
  );
}
