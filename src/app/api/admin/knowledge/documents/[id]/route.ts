import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const service = createSupabaseServiceClient();
    const { data: document, error } = await service.from('evidence_documents').select('storage_bucket, storage_path, file_name').eq('id', id).single();
    if (error || !document) return NextResponse.json({ error: 'Document tidak ditemukan.' }, { status: 404 });
    const { data: signed, error: signedError } = await service.storage.from(document.storage_bucket).createSignedUrl(document.storage_path, 3600);
    if (signedError) return NextResponse.json({ error: signedError.message }, { status: 500 });
    return NextResponse.json({ url: signed?.signedUrl, fileName: document.file_name });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR';
    return NextResponse.json({ error: code }, { status: code === 'FORBIDDEN' ? 403 : 401 });
  }
}
