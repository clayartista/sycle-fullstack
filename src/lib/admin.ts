import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) throw new Error('UNAUTHORIZED');
  const { data: profile, error } = await supabase.from('profiles').select('id, display_name, role').eq('id', userId).single();
  if (error || profile?.role !== 'admin') throw new Error('FORBIDDEN');
  return { supabase, userId, profile };
}
