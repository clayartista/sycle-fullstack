import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { z } from 'zod';

const schema = z.object({
  sourceId: z.string().uuid(),
  topicId: z.string().uuid(),
  claim: z.string().min(10).max(4000),
  summary: z.string().min(10).max(4000),
  population: z.string().max(500).optional(),
  context: z.string().max(1000).optional(),
  evidenceStrength: z.enum(['high','moderate','low','unclear']).default('unclear'),
  certainty: z.string().max(500).optional(),
  direction: z.string().max(120).optional(),
  limitations: z.array(z.string().max(800)).max(12).default([]),
  actionSuggestions: z.array(z.string().max(500)).max(12).default([]),
  reviewStatus: z.enum(['draft','review','approved','rejected','archived']).default('draft'),
  citationText: z.string().max(2000).optional(),
  page: z.number().int().min(1).optional(),
});

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const sourceId = url.searchParams.get('sourceId');
    let query = supabase.from('evidence_claims').select('id, source_id, topic_id, claim, summary, evidence_strength, limitations, action_suggestions, review_status, created_at').order('created_at', { ascending: false });
    if (sourceId) query = query.eq('source_id', sourceId);
    const { data, error } = await query.limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ claims: data || [] });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Claim tidak valid.', issues: parsed.error.flatten() }, { status: 400 });
    const p = parsed.data;
    const { data, error } = await supabase.from('evidence_claims').insert({
      source_id: p.sourceId,
      topic_id: p.topicId,
      claim: p.claim,
      summary: p.summary,
      population: p.population || null,
      context: p.context || null,
      evidence_strength: p.evidenceStrength,
      certainty: p.certainty || null,
      direction: p.direction || null,
      limitations: p.limitations,
      action_suggestions: p.actionSuggestions,
      review_status: p.reviewStatus,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (p.citationText) {
      const { error: citationError } = await supabase.from('evidence_citations').insert({
        claim_id: data.id,
        source_id: p.sourceId,
        citation_text: p.citationText,
        page: p.page || null,
        doi: null,
        url: null,
      });
      if (citationError) return NextResponse.json({ error: citationError.message }, { status: 500 });
    }
    return NextResponse.json({ claim: data }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}
