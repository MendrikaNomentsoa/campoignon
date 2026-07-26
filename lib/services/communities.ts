import { SupabaseClient } from '@supabase/supabase-js';

const INACTIVITY_DAYS = 3;

// Lister les 4 communautés fixes
export async function listCommunities(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Détails d'une communauté
export async function getCommunity(
  supabase: SupabaseClient,
  { communityId }: { communityId: string }
) {
  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members(id)')
    .eq('id', communityId)
    .single();

  if (error) {
    return { error: error.message, status: 404 } as const;
  }

  return { data } as const;
}

// Rejoindre une communauté (idempotent : déjà membre => succès, pas d'erreur)
export async function joinCommunity(
  supabase: SupabaseClient,
  { communityId, userId }: { communityId: string; userId: string }
) {
  const { data: existing } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { alreadyMember: true, data: existing } as const;
  }

  const { data, error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: userId })
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { alreadyMember: false, data } as const;
}

// Membres inactifs depuis INACTIVITY_DAYS (pas d'entrée journal ET tâches en souffrance)
export async function getStalledMembers(
  supabase: SupabaseClient,
  { communityId }: { communityId: string }
) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - INACTIVITY_DAYS);
  const thresholdIso = thresholdDate.toISOString();

  const { data: members, error: membersError } = await supabase
    .from('community_members')
    .select('user_id, profiles(username)')
    .eq('community_id', communityId);

  if (membersError) {
    return { error: membersError.message, status: 500 } as const;
  }

  const stalled = [];

  for (const member of members ?? []) {
    const { data: lastEntry } = await supabase
      .from('learning_entries')
      .select('created_at')
      .eq('community_id', communityId)
      .eq('user_id', member.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const noRecentEntry = !lastEntry || lastEntry.created_at < thresholdIso;

    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('id, title, deadline, status, created_at, challenges!inner(community_id)')
      .eq('assigned_to', member.user_id)
      .eq('status', 'pending')
      .eq('challenges.community_id', communityId);

    const stalledTasks = (tasks ?? []).filter((task) => {
      const overdue = task.deadline && task.deadline < new Date().toISOString();
      const stagnant = task.created_at < thresholdIso;
      return overdue || stagnant;
    });

    if (noRecentEntry && stalledTasks.length > 0) {
      stalled.push({
        user_id: member.user_id,
        username: (member.profiles as any)?.username,
        last_entry_at: lastEntry?.created_at ?? null,
        stalled_tasks: stalledTasks,
      });
    }
  }

  return { data: stalled } as const;
}