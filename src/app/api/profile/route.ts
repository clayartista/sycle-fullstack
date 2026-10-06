import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logEvent } from '@/lib/observability';

const patchSchema = z.object({
  ageRange: z.string().max(80).optional(),
  womenContext: z.array(z.string().max(80)).max(10).optional(),
  preferredLocation: z.string().max(160).optional(),
  setupComplete: z.boolean().optional(),
  firstHomeSeen: z.boolean().optional(),
});

async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub as string | undefined };
}

export async function GET() {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('profiles').select('id, display_name, setup_complete, first_home_seen, age_range, women_context, preferred_location').eq('id', userId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
  const { supabase, userId } = await currentUser();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Profil belum valid.', issues: parsed.error.flatten() }, { status: 400 });

  const p = parsed.data;
  const update = {
    ...(p.ageRange !== undefined ? { age_range: p.ageRange } : {}),
    ...(p.womenContext !== undefined ? { women_context: p.womenContext } : {}),
    ...(p.preferredLocation !== undefined ? { preferred_location: p.preferredLocation } : {}),
    ...(p.setupComplete !== undefined ? { setup_complete: p.setupComplete } : {}),
    ...(p.firstHomeSeen !== undefined ? { first_home_seen: p.firstHomeSeen } : {}),
  };

  const { data, error } = await supabase.from('profiles').update(update).eq('id', userId).select('id, display_name, setup_complete, first_home_seen, age_range, women_context, preferred_location').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  logEvent('profile.update', { userId });
  return NextResponse.json({ profile: data });
}
