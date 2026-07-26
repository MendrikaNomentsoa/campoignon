import { SupabaseClient } from '@supabase/supabase-js';

// Lister les challenges d'une communauté
export async function listChallenges(
  supabase: SupabaseClient,
  { communityId }: { communityId: string }
) {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, challenge_participants(id, user_id, total_points, progress, status)')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Défis à venir toutes communautés confondues (pour la notification globale)
export async function listUpcomingChallenges(
  supabase: SupabaseClient,
  { userId }: { userId: string }
) {
  const { data: memberships, error: membershipsError } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', userId);

  if (membershipsError) {
    return { error: membershipsError.message, status: 500 } as const;
  }

  const communityIds = (memberships ?? []).map((m) => m.community_id);

  if (communityIds.length === 0) {
    return { data: [] } as const;
  }

  const { data, error } = await supabase
    .from('challenges')
    .select('id, title, reward, status, deadline, community_id, communities(name)')
    .in('community_id', communityIds)
    .neq('status', 'finished')
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Créer un challenge (le créateur rejoint automatiquement)
export async function createChallenge(
  supabase: SupabaseClient,
  {
    communityId,
    creatorId,
    title,
    description,
    reward,
    deadline,
  }: {
    communityId: string;
    creatorId: string;
    title: string;
    description?: string;
    reward?: string;
    deadline?: string;
  }
) {
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      community_id: communityId,
      creator_id: creatorId,
      title,
      description,
      reward,
      deadline,
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  const { error: joinError } = await supabase
    .from('challenge_participants')
    .insert({
      challenge_id: data.id,
      user_id: creatorId,
    });

  if (joinError) {
    return { error: joinError.message, status: 500 } as const;
  }

  return { data } as const;
}

// Rejoindre un challenge existant
export async function joinChallenge(
  supabase: SupabaseClient,
  { challengeId, userId }: { challengeId: string; userId: string }
) {
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('id, status')
    .eq('id', challengeId)
    .single();

  if (challengeError || !challenge) {
    return { error: 'Challenge introuvable', status: 404 } as const;
  }

  if (challenge.status === 'finished') {
    return { error: 'Ce challenge est déjà terminé', status: 400 } as const;
  }

  const { data: existing } = await supabase
    .from('challenge_participants')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { error: 'Tu participes déjà à ce challenge', status: 400 } as const;
  }

  const { data, error } = await supabase
    .from('challenge_participants')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Mettre à jour la progression globale (%) d'un participant
export async function updateProgress(
  supabase: SupabaseClient,
  {
    challengeId,
    userId,
    progress,
  }: { challengeId: string; userId: string; progress: number }
) {
  const { data: participant, error: participantError } = await supabase
    .from('challenge_participants')
    .select('id, status')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (participantError || !participant) {
    return { error: 'Tu ne participes pas à ce challenge', status: 403 } as const;
  }

  if (participant.status === 'finished') {
    return { error: 'Tu as déjà terminé ce challenge', status: 400 } as const;
  }

  const { data, error } = await supabase
    .from('challenge_participants')
    .update({ progress })
    .eq('id', participant.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  await supabase
    .from('challenges')
    .update({ status: 'in_progress' })
    .eq('id', challengeId)
    .eq('status', 'open');

  return { data } as const;
}

// Voir le classement d'un challenge
export async function getLeaderboard(
  supabase: SupabaseClient,
  { challengeId }: { challengeId: string }
) {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select('user_id, total_points, status, profiles(username)')
    .eq('challenge_id', challengeId)
    .order('total_points', { ascending: false });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Clôturer un challenge (créateur uniquement) — le gagnant est celui qui a le plus de points
export async function closeChallenge(
  supabase: SupabaseClient,
  { challengeId, userId }: { challengeId: string; userId: string }
) {
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('id, status, creator_id, title, winner_id')
    .eq('id', challengeId)
    .single();

  if (challengeError || !challenge) {
    return { error: 'Challenge introuvable', status: 404 } as const;
  }

  if (challenge.status === 'finished') {
    return { error: 'Ce challenge est déjà terminé', status: 400 } as const;
  }

  if (challenge.creator_id !== userId) {
    return {
      error: 'Seul le créateur du challenge peut le clôturer',
      status: 403,
    } as const;
  }

  const { data: participants, error: participantsError } = await supabase
    .from('challenge_participants')
    .select('user_id, total_points')
    .eq('challenge_id', challengeId)
    .order('total_points', { ascending: false });

  if (participantsError || !participants || participants.length === 0) {
    return { error: 'Aucun participant trouvé', status: 400 } as const;
  }

  const winner = participants[0];
  const now = new Date().toISOString();

  const { error: updateChallengeError } = await supabase
    .from('challenges')
    .update({
      status: 'finished',
      winner_id: winner.user_id,
      finished_at: now,
    })
    .eq('id', challengeId)
    .is('winner_id', null);

  if (updateChallengeError) {
    return { error: updateChallengeError.message, status: 500 } as const;
  }

  const { error: rewardError } = await supabase.from('rewards').insert({
    user_id: winner.user_id,
    challenge_id: challengeId,
    label: `🏆 Gagnant — ${challenge.title} (${winner.total_points} points)`,
  });

  if (rewardError) {
    return { error: rewardError.message, status: 500 } as const;
  }

  return {
    data: {
      result: 'closed',
      winner_id: winner.user_id,
      winning_points: winner.total_points,
      leaderboard: participants,
    },
  } as const;
}