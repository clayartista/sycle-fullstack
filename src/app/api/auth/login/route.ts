import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logEvent } from '@/lib/observability';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: 'Email atau kata sandi belum sesuai.' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(body.data);
  if (error || !data.user) return NextResponse.json({ error: 'Email atau kata sandi belum sesuai.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, setup_complete, first_home_seen, age_range, women_context, preferred_location')
    .eq('id', data.user.id)
    .maybeSingle();

  logEvent('auth.login', { userId: data.user.id });
  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email, name: profile?.display_name ?? data.user.user_metadata?.name ?? '' },
    profile: profile ? {
      setupComplete: Boolean(profile.setup_complete),
      firstHomeSeen: Boolean(profile.first_home_seen),
      ageRange: profile.age_range,
      womenContext: profile.women_context ?? [],
      preferredLocation: profile.preferred_location,
    } : null,
  });
}
