import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { journalSchema, toJournalEntry } from '@/lib/journal';
import { logEvent } from '@/lib/observability';

async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub as string | undefined };
}

export async function GET() {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('journal_entries').select('*, journal_entry_topics(topic:evidence_topics(*))').order('entry_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: (data ?? []).map(toJournalEntry) });
}

export async function POST(request: Request) {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = journalSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Payload jurnal tidak valid.', issues: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await supabase.from('journal_entries').upsert({
    ...(parsed.data.id ? { id: parsed.data.id } : {}),
    user_id: userId,
    entry_date: parsed.data.date,
    location: parsed.data.location,
    env_data: parsed.data.envData,
    personalization: parsed.data.personalization,
    topics: parsed.data.topics,
    reflection: parsed.data.reflection ?? null,
  }, { onConflict: 'user_id,entry_date' }).select('*').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('journal_entry_topics').delete().eq('journal_entry_id', data.id);
  const topicRows = parsed.data.topics
    .map((topic: Record<string, unknown>) => typeof topic.id === 'string' ? { journal_entry_id: data.id, topic_id: topic.id } : null)
    .filter(Boolean) as Array<{ journal_entry_id: string; topic_id: string }>;
  if (topicRows.length) await supabase.from('journal_entry_topics').insert(topicRows);

  const { data: joined, error: joinError } = await supabase
    .from('journal_entries')
    .select('*, journal_entry_topics(topic:evidence_topics(*))')
    .eq('id', data.id)
    .single();
  if (joinError || !joined) return NextResponse.json({ error: joinError?.message || 'Gagal memuat jurnal.' }, { status: 500 });

  logEvent('journal.upsert', { userId, journalId: data.id });
  return NextResponse.json({ entry: toJournalEntry(joined) }, { status: 201 });
}
