import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { z } from 'zod';

const topicSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  description: z.string().max(5000).default(''),
  whyRelevant: z.string().max(5000).default(''),
  category: z.string().max(120).default('reproductive-health'),
  defaultActions: z.array(z.string().max(240)).max(12).default([]),
  status: z.enum(['draft','published','archived']).default('draft'),
});

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const [{ data: topics }, { data: sources }, { data: jobs }] = await Promise.all([
      supabase.from('knowledge_topics').select('id, slug, name, status, updated_at').order('name'),
      supabase.from('evidence_sources').select('id, title, source_type, publication_year, verified, status, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('ingestion_jobs').select('id, source_id, document_id, status, progress, error_message, created_at, completed_at').order('created_at', { ascending: false }).limit(20),
    ]);
    return NextResponse.json({ topics: topics || [], sources: sources || [], jobs: jobs || [] });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code === 'FORBIDDEN' ? 'Admin only.' : code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();
    const parsed = topicSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Topic tidak valid.', issues: parsed.error.flatten() }, { status: 400 });
    const p = parsed.data;
    const { data, error } = await supabase.from('knowledge_topics').insert({
      slug: p.slug, name: p.name, description: p.description, why_relevant: p.whyRelevant,
      category: p.category, default_actions: p.defaultActions, status: p.status,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ topic: data }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}
