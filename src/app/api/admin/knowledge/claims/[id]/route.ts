import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { z } from 'zod';

const schema = z.object({
  summary: z.string().max(4000).optional(),
  limitations: z.array(z.string().max(800)).max(12).optional(),
  actionSuggestions: z.array(z.string().max(500)).max(12).optional(),
  reviewStatus: z.enum(['draft','review','approved','rejected','archived']).optional(),
  evidenceStrength: z.enum(['high','moderate','low','unclear']).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Claim tidak valid.', issues: parsed.error.flatten() }, { status: 400 });
    const p = parsed.data;
    const update = {
      ...(p.summary !== undefined ? { summary: p.summary } : {}),
      ...(p.limitations !== undefined ? { limitations: p.limitations } : {}),
      ...(p.actionSuggestions !== undefined ? { action_suggestions: p.actionSuggestions } : {}),
      ...(p.reviewStatus !== undefined ? { review_status: p.reviewStatus } : {}),
      ...(p.evidenceStrength !== undefined ? { evidence_strength: p.evidenceStrength } : {}),
    };
    const { data, error } = await supabase.from('evidence_claims').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ claim: data });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}
