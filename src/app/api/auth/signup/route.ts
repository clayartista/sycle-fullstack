import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logEvent } from '@/lib/observability';

const schema = z.object({ name: z.string().min(1).max(120), email: z.string().email(), password: z.string().min(8) });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: 'Data pendaftaran belum lengkap.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: body.data.email,
    password: body.data.password,
    options: { data: { name: body.data.name } },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (data.user) {
    await supabase.from('profiles').upsert({ id: data.user.id, display_name: body.data.name });
  }
  logEvent('auth.signup', { userId: data.user?.id ?? null });
  return NextResponse.json({ user: data.user ? { id: data.user.id, email: data.user.email, name: body.data.name } : null });
}
