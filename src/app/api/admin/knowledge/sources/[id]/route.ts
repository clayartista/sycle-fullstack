import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { z } from 'zod';

const sourceSchema = z.object({
  status: z.enum(['draft','review','published','archived']).optional(),
  verified: z.boolean().optional(),
  evidenceLevel: z.string().max(80).optional(),
  authors: z.string().max(1000).optional(),
  publisher: z.string().max(500).optional(),
  journal: z.string().max(500).optional(),
  doi: z.string().max(500).optional(),
  url: z.string().url().optional(),
  publicationYear: z.number().int().min(1900).max(2100).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, userId } = await requireAdmin();
    const { id } = await context.params;
    const parsed = sourceSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Source tidak valid.', issues: parsed.error.flatten() }, { status: 400 });
    const p = parsed.data;
    const update = {
      ...(p.status !== undefined ? { status: p.status } : {}),
      ...(p.verified !== undefined ? { verified: p.verified } : {}),
      ...(p.evidenceLevel !== undefined ? { evidence_level: p.evidenceLevel } : {}),
      ...(p.authors !== undefined ? { authors: p.authors } : {}),
      ...(p.publisher !== undefined ? { publisher: p.publisher } : {}),
      ...(p.journal !== undefined ? { journal: p.journal } : {}),
      ...(p.doi !== undefined ? { doi: p.doi } : {}),
      ...(p.url !== undefined ? { url: p.url } : {}),
      ...(p.publicationYear !== undefined ? { publication_year: p.publicationYear } : {}),
      ...(p.status === 'published' || p.verified === true ? { reviewed_by: userId, reviewed_at: new Date().toISOString() } : {}),
    };
    const { data, error } = await supabase.from('evidence_sources').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ source: data });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}
