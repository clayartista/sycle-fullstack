import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { journalSchema, toJournalEntry } from '@/lib/journal';

async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub as string | undefined };
}

const patchSchema = journalSchema.partial().omit({ id: true });

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabase.from('journal_entries').select('*, journal_entry_topics(topic:evidence_topics(*))').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  return NextResponse.json({ entry: toJournalEntry(data) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = patchSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: 'Payload jurnal tidak valid.' }, { status: 400 });
  const data = body.data;
  const { data: updated, error } = await supabase.from('journal_entries').update({
    ...(data.date ? { entry_date: data.date } : {}),
    ...(data.location ? { location: data.location } : {}),
    ...(data.envData ? { env_data: data.envData } : {}),
    ...(data.personalization ? { personalization: data.personalization } : {}),
    ...(data.topics ? { topics: data.topics } : {}),
    ...(data.reflection !== undefined ? { reflection: data.reflection } : {}),
  }).eq('id', id).eq('user_id', userId).select('*, journal_entry_topics(topic:evidence_topics(*))').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data.topics) {
    await supabase.from('journal_entry_topics').delete().eq('journal_entry_id', id);
    const topicRows = data.topics.map((topic: Record<string, unknown>) => typeof topic.id === 'string' ? { journal_entry_id: id, topic_id: topic.id } : null).filter(Boolean) as Array<{ journal_entry_id: string; topic_id: string }>;
    if (topicRows.length) await supabase.from('journal_entry_topics').insert(topicRows);
  }
  return NextResponse.json({ entry: toJournalEntry(updated) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
