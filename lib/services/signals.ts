import { SupabaseClient } from '@supabase/supabase-js';

// Lister les signaux ouverts d'une communauté
export async function listSignals(
  supabase: SupabaseClient,
  { communityId }: { communityId: string }
) {
  const { data, error } = await supabase
    .from('community_signals')
    .select('*, profiles(username), challenge_tasks(title)')
    .eq('community_id', communityId)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// La personne inactive fait son choix : demander de l'aide ou libérer sa tâche
export async function createSignal(
  supabase: SupabaseClient,
  {
    userId,
    communityId,
    challengeId,
    taskId,
    type,
    message,
  }: {
    userId: string;
    communityId: string;
    challengeId?: string | null;
    taskId?: string | null;
    type: 'ask_help' | 'release_task';
    message?: string | null;
  }
) {
  if (!['ask_help', 'release_task'].includes(type)) {
    return {
      error: "type doit être 'ask_help' ou 'release_task'",
      status: 400,
    } as const;
  }

  const { data: signal, error: signalError } = await supabase
    .from('community_signals')
    .insert({
      user_id: userId,
      community_id: communityId,
      challenge_id: challengeId ?? null,
      task_id: taskId ?? null,
      type,
      message: message ?? null,
    })
    .select()
    .single();

  if (signalError) {
    return { error: signalError.message, status: 500 } as const;
  }

  // Si la personne libère sa tâche, on la rend disponible pour quelqu'un d'autre
  if (type === 'release_task' && taskId) {
    const { error: releaseError } = await supabase
      .from('challenge_tasks')
      .update({ assigned_to: null })
      .eq('id', taskId);

    if (releaseError) {
      return { error: releaseError.message, status: 500 } as const;
    }
  }

  return { data: signal } as const;
}