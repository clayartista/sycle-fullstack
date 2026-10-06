import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { z } from 'zod';

export const runtime = 'nodejs';

const metaSchema = z.object({
  title: z.string().min(3).max(500),
  sourceType: z.string().min(2).max(100).default('research'),
  topicId: z.string().uuid(),
  authors: z.string().max(1000).optional(),
  publisher: z.string().max(500).optional(),
  journal: z.string().max(500).optional(),
  publicationYear: z.coerce.number().int().min(1900).max(2100).optional(),
  doi: z.string().max(500).optional(),
  url: z.string().url().optional(),
  evidenceLevel: z.string().max(80).optional(),
  language: z.string().max(20).default('en'),
});

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 120);
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAdmin();
    const form = await request.formData();
    const file = form.get('file');
    const rawMeta = form.get('metadata');
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Upload harus berupa PDF.' }, { status: 400 });
    }
    const parsed = metaSchema.safeParse(JSON.parse(String(rawMeta || '{}')));
    if (!parsed.success) return NextResponse.json({ error: 'Metadata source tidak valid.', issues: parsed.error.flatten() }, { status: 400 });

    const service = createSupabaseServiceClient();
    const meta = parsed.data;
    const { data: source, error: sourceError } = await service.from('evidence_sources').insert({
      title: meta.title,
      source_type: meta.sourceType,
      authors: meta.authors || null,
      publisher: meta.publisher || null,
      journal: meta.journal || null,
      publication_year: meta.publicationYear || null,
      doi: meta.doi || null,
      url: meta.url || null,
      evidence_level: meta.evidenceLevel || null,
      language: meta.language,
      status: 'draft',
      verified: false,
    }).select().single();
    if (sourceError || !source) return NextResponse.json({ error: sourceError?.message || 'Gagal membuat source.' }, { status: 500 });

    const path = `sources/${source.id}/${Date.now()}-${safeName(file.name)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: storageError } = await service.storage.from('research-library').upload(path, bytes, { contentType: 'application/pdf', upsert: false });
    if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });

    const { data: document, error: docError } = await service.from('evidence_documents').insert({
      source_id: source.id,
      file_name: file.name,
      storage_bucket: 'research-library',
      storage_path: path,
      mime_type: 'application/pdf',
      file_size: file.size,
    }).select().single();
    if (docError || !document) return NextResponse.json({ error: docError?.message || 'Gagal membuat document.' }, { status: 500 });

    const { data: job, error: jobError } = await service.from('ingestion_jobs').insert({ source_id: source.id, document_id: document.id, status: 'queued', created_by: userId }).select().single();
    if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 });

    await service.from('topic_evidence').upsert({ topic_id: meta.topicId, source_id: source.id, priority: 100 });
    return NextResponse.json({ source, document, job }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}
