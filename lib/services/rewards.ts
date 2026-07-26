import { SupabaseClient } from '@supabase/supabase-js';

export async function listRewards(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*, challenges(title)')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}