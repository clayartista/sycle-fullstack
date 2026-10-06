import { NextResponse } from 'next/server';
import { retrieveEvidence } from '@/lib/evidence/retrieval';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || undefined;
  const q = url.searchParams.get('q') || topic || '';
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 6), 1), 12);
  if (!q.trim()) return NextResponse.json({ error: 'Parameter q atau topic wajib diisi.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { results, mode } = await retrieveEvidence(q, topic, limit);
  return NextResponse.json({ mode, query: q, results });
}
