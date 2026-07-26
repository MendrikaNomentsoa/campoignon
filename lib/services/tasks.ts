import { SupabaseClient } from '@supabase/supabase-js';

const PENALTY_PER_DAY_LATE = 2;

// Lister les tâches d'un challenge
export async function listTasks(
  supabase: SupabaseClient,
  { challengeId }: { challengeId: string }
) {
  const { data, error } = await supabase
    .from('challenge_tasks')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Créer/assigner une tâche (humain ou IA)
export async function createTask(
  supabase: SupabaseClient,
  {
    challengeId,
    createdBy,
    assignedTo,
    title,
    description,
    points,
    deadline,
  }: {
    challengeId: string;
    createdBy: string;
    assignedTo: string;
    title: string;
    description?: string;
    points?: number;
    deadline?: string;
  }
) {
  // Vérifier que la personne assignée participe bien au challenge
  const { data: participant, error: participantError } = await supabase
    .from('challenge_participants')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', assignedTo)
    .maybeSingle();

  if (participantError || !participant) {
    return {
      error: 'La personne assignée ne participe pas à ce challenge',
      status: 400,
    } as const;
  }

  const { data, error } = await supabase
    .from('challenge_tasks')
    .insert({
      challenge_id: challengeId,
      assigned_to: assignedTo,
      created_by: createdBy,
      title,
      description,
      points: points ?? 10,
      deadline,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data } as const;
}

// Terminer une tâche — calcul des points selon retard éventuel
export async function completeTask(
  supabase: SupabaseClient,
  {
    challengeId,
    taskId,
    userId,
  }: { challengeId: string; taskId: string; userId: string }
) {
  const { data: task, error: taskError } = await supabase
    .from('challenge_tasks')
    .select('*')
    .eq('id', taskId)
    .eq('challenge_id', challengeId)
    .single();

  if (taskError || !task) {
    return { error: 'Tâche introuvable', status: 404 } as const;
  }

  if (task.assigned_to !== userId) {
    return { error: "Cette tâche ne t'est pas assignée", status: 403 } as const;
  }

  if (task.status === 'done') {
    return { error: 'Cette tâche est déjà terminée', status: 400 } as const;
  }

  const now = new Date();
  let earnedPoints = task.points;

  if (task.deadline) {
    const deadline = new Date(task.deadline);
    if (now > deadline) {
      const msLate = now.getTime() - deadline.getTime();
      const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24));
      earnedPoints = Math.max(0, task.points - daysLate * PENALTY_PER_DAY_LATE);
    }
  }

  const { error: updateTaskError } = await supabase
    .from('challenge_tasks')
    .update({ status: 'done', completed_at: now.toISOString() })
    .eq('id', taskId);

  if (updateTaskError) {
    return { error: updateTaskError.message, status: 500 } as const;
  }

  const { data: participant, error: participantError } = await supabase
    .from('challenge_participants')
    .select('id, total_points')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (participantError || !participant) {
    return {
      error: 'Participant introuvable pour ce challenge',
      status: 404,
    } as const;
  }

  const newTotal = participant.total_points + earnedPoints;

  const { error: updatePointsError } = await supabase
    .from('challenge_participants')
    .update({ total_points: newTotal })
    .eq('id', participant.id);

  if (updatePointsError) {
    return { error: updatePointsError.message, status: 500 } as const;
  }

  return {
    data: {
      task_points_earned: earnedPoints,
      total_points: newTotal,
      was_late: earnedPoints < task.points,
    },
  } as const;
}

// Reprendre une tâche libérée par quelqu'un d'autre
export async function claimTask(
  supabase: SupabaseClient,
  {
    challengeId,
    taskId,
    userId,
  }: { challengeId: string; taskId: string; userId: string }
) {
  const { data: participant, error: participantError } = await supabase
    .from('challenge_participants')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (participantError || !participant) {
    return {
      error: 'Tu dois rejoindre le challenge avant de reprendre une tâche',
      status: 403,
    } as const;
  }

  const { data: task, error: taskError } = await supabase
    .from('challenge_tasks')
    .select('id, assigned_to, status')
    .eq('id', taskId)
    .eq('challenge_id', challengeId)
    .single();

  if (taskError || !task) {
    return { error: 'Tâche introuvable', status: 404 } as const;
  }

  if (task.assigned_to) {
    return {
      error: "Cette tâche est déjà assignée à quelqu'un",
      status: 400,
    } as const;
  }

  if (task.status === 'done') {
    return { error: 'Cette tâche est déjà terminée', status: 400 } as const;
  }

  const { data, error } = await supabase
    .from('challenge_tasks')
    .update({ assigned_to: userId })
    .eq('id', taskId)
    .is('assigned_to', null)
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  if (!data) {
    return {
      error: "Quelqu'un d'autre vient de reprendre cette tâche",
      status: 409,
    } as const;
  }

  await supabase
    .from('community_signals')
    .update({ status: 'resolved' })
    .eq('task_id', taskId)
    .eq('type', 'release_task')
    .eq('status', 'open');

  return { data } as const;
}