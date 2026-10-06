"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TASKS = [
  { id: 'value', label: 'Dalam 10–15 detik, jelaskan menurutmu apa itu SYCLE.' },
  { id: 'environment', label: 'Jelaskan mengapa kondisi lingkungan ditampilkan di SYCLE.' },
  { id: 'action', label: 'Temukan apa yang bisa kamu lakukan setelah melihat kondisi lingkungan.' },
  { id: 'summary', label: 'Temukan “Ringkasan Hari Ini” tanpa berpindah ke halaman lain.' },
  { id: 'evidence', label: 'Buka evidence yang paling relevan dengan konteksmu dan lihat sumbernya.' },
  { id: 'tracker', label: 'Simpan hari ini ke Health Tracker.' },
  { id: 'location', label: 'Jelaskan kenapa SYCLE meminta izin lokasi dan apakah kamu tetap punya pilihan jika tidak mengizinkannya.' },
];

export default function UATPage() {
  const router = useRouter();
  const [participantCode, setParticipantCode] = useState('P01');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState<Record<string, number>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [findings, setFindings] = useState(['', '', '']);
  const [overallNote, setOverallNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    const payload = {
      participantCode,
      completedTasks: TASKS.map((task) => ({ id: task.id, completed: Boolean(completed[task.id]), seconds: seconds[task.id] || 0 })),
      responses,
      findings: findings.filter(Boolean),
      overallNote,
    };
    const response = await fetch('/api/uat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setError(data?.error || 'UAT belum dapat disimpan. Pastikan Supabase sudah aktif.'); return; }
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10">
      <div className="bg-white rounded-3xl border border-sycle-border p-5 lg:p-7 shadow-sm">
        <p className="text-xs font-700 uppercase tracking-[0.15em] text-rose mb-1">UAT SYCLE</p>
        <h1 className="font-800 text-2xl text-sycle-dark">Validasi alur utama dengan 1–2 calon pengguna</h1>
        <p className="text-sm text-sycle-muted mt-2 leading-relaxed">Catat apa yang benar-benar dilakukan tester. Jangan membantu tester menemukan jawaban kecuali dibutuhkan untuk menyelesaikan tugas.</p>

        <div className="mt-5 rounded-2xl bg-sycle-bg border border-sycle-border p-4">
          <label className="text-xs font-700 text-sycle-dark">Kode peserta</label>
          <input value={participantCode} onChange={(e) => setParticipantCode(e.target.value)} className="mt-2 w-full max-w-xs bg-white border border-sycle-border rounded-xl px-3 py-2.5 text-sm" />
        </div>

        <div className="mt-5 space-y-3">
          {TASKS.map((task, index) => (
            <div key={task.id} className="rounded-2xl border border-sycle-border p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={Boolean(completed[task.id])} onChange={(e) => setCompleted((prev) => ({ ...prev, [task.id]: e.target.checked }))} className="mt-1" />
                <div className="flex-1"><p className="text-sm font-700 text-sycle-dark">{index + 1}. {task.label}</p><div className="grid sm:grid-cols-[160px_1fr] gap-2 mt-3"><input inputMode="numeric" value={seconds[task.id] || ''} onChange={(e) => setSeconds((prev) => ({ ...prev, [task.id]: Number(e.target.value) || 0 }))} placeholder="Detik" className="bg-white border border-sycle-border rounded-xl px-3 py-2 text-sm" /><input value={responses[task.id] || ''} onChange={(e) => setResponses((prev) => ({ ...prev, [task.id]: e.target.value }))} placeholder="Komentar / apa yang dilakukan tester" className="bg-white border border-sycle-border rounded-xl px-3 py-2 text-sm" /></div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-2">3 temuan utama</p>
          <div className="space-y-2">{findings.map((finding, index) => <input key={index} value={finding} onChange={(e) => setFindings((prev) => prev.map((item, i) => i === index ? e.target.value : item))} placeholder={`Temuan #${index + 1}`} className="w-full bg-white border border-sycle-border rounded-xl px-3 py-2.5 text-sm" />)}</div>
        </div>

        <div className="mt-5"><p className="text-xs font-700 uppercase tracking-wide text-sycle-muted mb-2">Catatan keseluruhan</p><textarea value={overallNote} onChange={(e) => setOverallNote(e.target.value)} rows={4} className="w-full bg-white border border-sycle-border rounded-xl px-3 py-3 text-sm" placeholder="Apa yang paling membingungkan? Bagian mana yang paling membantu?" /></div>

        {error && <p className="mt-4 rounded-xl bg-blush px-4 py-3 text-sm text-rose-dark">{error}</p>}
        {submitted ? <div className="mt-5 rounded-2xl bg-sage border border-sage p-4 text-sm font-700 text-green-800">Hasil UAT tersimpan. Gunakan temuan ini untuk revisi berikutnya.</div> : <button onClick={() => void submit()} className="mt-5 w-full bg-rose text-white rounded-xl py-3.5 text-sm font-700 hover:bg-rose-dark">Simpan hasil UAT</button>}
        <button onClick={() => router.back()} className="w-full mt-3 text-sycle-muted text-sm py-2">Kembali</button>
      </div>
    </div>
  );
}
