import { NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveEvidence } from '@/lib/evidence/retrieval';

export const runtime = 'nodejs';

const schema = z.object({
  query: z.string().min(3).max(1200),
  topic: z.string().max(120).optional(),
  style: z.enum(['lebih sederhana','lebih singkat','lebih lengkap']).default('lebih sederhana'),
});

async function generateWithProvider(prompt: string) {
  const url = process.env.AI_CHAT_API_URL;
  const key = process.env.AI_CHAT_API_KEY;
  const model = process.env.AI_CHAT_MODEL;
  if (!url || !key || !model) return null;
  const response = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, temperature: 0.1, messages: [
      { role: 'system', content: 'Kamu adalah penjelas evidence kesehatan untuk SYCLE. Gunakan hanya evidence yang diberikan. Jangan mendiagnosis, jangan mengarang fakta, dan nyatakan ketidakpastian.' },
      { role: 'user', content: prompt },
    ]}),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  const { query, topic, style } = parsed.data;
  const { results } = await retrieveEvidence(query, topic, 6);
  if (!results.length) return NextResponse.json({ explanation: 'Belum ada evidence terkurasi yang cocok untuk pertanyaan ini.', citations: [] });
  const evidenceText = results.map((r, i) => {
    const year = r.citation.publicationYear ? ` (${r.citation.publicationYear})` : '';
    const page = r.pageNumber ? `, p.${r.pageNumber}` : '';
    return `[${i + 1}] ${r.claimSummary || r.claim || r.content}\nSumber: ${r.citation.sourceTitle}${year}${page}`;
  }).join('\n\n');
  const prompt = `Pertanyaan pengguna: ${query}\nPreferensi penjelasan: ${style}\n\nEvidence terkurasi:\n${evidenceText}\n\nTulis jawaban singkat berbahasa Indonesia dengan struktur: "Yang perlu dipahami" + "Batasan evidence". Jangan membuat diagnosis atau rekomendasi medis spesifik yang tidak didukung evidence. Simpan nomor citation [1], [2], dst.`;
  const explanation = await generateWithProvider(prompt);
  const fallback = results.slice(0, 3).map((r, i) => `${i + 1}. ${r.claimSummary || r.claim || r.content}`).join(' ');
  return NextResponse.json({ explanation: explanation || fallback, citations: results.map((r, i) => ({ index: i+1, ...r.citation })) });
}
