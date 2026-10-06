import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  if (!userId) return NextResponse.json({ user: null, profile: null });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, setup_complete, first_home_seen, age_range, women_context, preferred_location')
    .eq('id', userId)
    .maybeSingle();

  return NextResponse.json({
    user: {
      id: userId,
      name: profile?.display_name ?? '',
      email: claimsData.claims.email ?? '',
    },
    profile: profile ? {
      setupComplete: Boolean(profile.setup_complete),
      firstHomeSeen: Boolean(profile.first_home_seen),
      ageRange: profile.age_range,
      womenContext: profile.women_context ?? [],
      preferredLocation: profile.preferred_location,
    } : null,
  });
}
