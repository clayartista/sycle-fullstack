import { NextResponse } from 'next/server';
import { getEvidenceTopic } from '@/lib/evidence/retrieval';

export async function GET(_request: Request, context: { params: Promise<{ topic: string }> }) {
  const { topic } = await context.params;
  const payload = await getEvidenceTopic(topic);
  if (!payload) return NextResponse.json({ error: 'Topik evidence tidak ditemukan.' }, { status: 404 });
  return NextResponse.json(payload);
}
