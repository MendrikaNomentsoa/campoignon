import { SupabaseClient } from '@supabase/supabase-js';

export async function listEntries(
  supabase: SupabaseClient,
  { communityId }: { communityId: string }
) {
  const { data, error } = await supabase
    .from('learning_entries')
    .select('*, profiles(username)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

export async function createEntry(
  supabase: SupabaseClient,
  {
    communityId,
    userId,
    content,
  }: { communityId: string; userId: string; content: string }
) {
  const { data, error } = await supabase
    .from('learning_entries')
    .insert({ community_id: communityId, user_id: userId, content })
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}