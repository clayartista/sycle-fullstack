import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: 'Email tidak valid.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const origin = request.headers.get('origin') ?? new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(body.data.email, { redirectTo: `${origin}/masuk` });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
