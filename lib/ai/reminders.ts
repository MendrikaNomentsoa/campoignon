// lib/ai/reminders.ts
import { createGroqClient, getGroqModel } from './client';
import { getReminderPrompt } from './prompts';
import { SupabaseClient } from '@supabase/supabase-js';

interface ReminderContext {
  userId: string;
  communityId: string;
  communityName: string;
  username: string;
  challengeTitle?: string | null;
  progress?: number | null;
  daysSinceLastEntry?: number | null;
 pendingTasks?: Array<{ title: string; status: string; deadline?: string | null }> | null;
}

export async function generateReminder(
  supabase: SupabaseClient,
  context: ReminderContext
) {
  try {
    // 1. Construire le prompt pour le rappel
    const prompt = getReminderPrompt({
      username: context.username,
      communityName: context.communityName,
      challengeTitle: context.challengeTitle,
      progress: context.progress,
      tasks: context.pendingTasks || [],
      daysSinceLastEntry: context.daysSinceLastEntry,
    });

    // 2. Appeler l'API Groq
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: "Tu es un assistant qui génère des rappels personnalisés et encourageants. Réponds uniquement avec le message de rappel, sans aucune autre information. Le message doit faire moins de 150 caractères." 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const reminderMessage = chatResponse.choices?.[0]?.message?.content;

    if (!reminderMessage) {
      console.error('Erreur: Aucun rappel généré.');
      return { error: "Impossible de générer un rappel." };
    }

    return { data: reminderMessage };
  } catch (error) {
    console.error('Erreur dans generateReminder:', error);
    return { error: "Une erreur est survenue lors de la génération du rappel." };
  }
}

/**
 * Fonction pour identifier les utilisateurs qui ont besoin d'un rappel.
 * À appeler périodiquement (via un cron job).
 */
export async function getUsersNeedingReminder(supabase: SupabaseClient) {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // 1. Récupérer les utilisateurs qui n'ont pas posté d'entrée depuis 3 jours
 const { data: allEntries, error: entriesError } = await supabase
  .from('learning_entries')
  .select('user_id, community_id, created_at')
  .order('created_at', { ascending: false });

if (entriesError) {
  console.error('Erreur lors de la récupération des entrées:', entriesError);
  return { error: "Erreur lors de la récupération des entrées." };
}

// Filtrer manuellement pour trouver les utilisateurs inactifs
const userLastEntry = new Map<string, { communityId: string; lastEntry: Date }>();

for (const entry of allEntries || []) {
  const key = `${entry.user_id}-${entry.community_id}`;
  if (!userLastEntry.has(key)) {
    userLastEntry.set(key, {
      communityId: entry.community_id,
      lastEntry: new Date(entry.created_at)
    });
  }
}

const inactiveUsers = [];
for (const [key, value] of userLastEntry) {
  const daysSinceLastEntry = Math.floor((Date.now() - value.lastEntry.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceLastEntry >= 3) {
    const [userId, communityId] = key.split('-');
    inactiveUsers.push({
      user_id: userId,
      community_id: communityId,
      last_entry_at: value.lastEntry.toISOString()
    });
  }
}

  // 2. Pour chaque utilisateur, récupérer plus d'informations et générer un rappel
  const remindersToInsert = [];

  for (const record of inactiveUsers || []) {
    const userId = record.user_id;
    const communityId = record.community_id;

    // Récupérer le profil de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error(`Erreur lors de la récupération du profil pour ${userId}:`, profileError);
      continue;
    }

    // Récupérer la communauté
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    if (communityError) {
      console.error(`Erreur lors de la récupération de la communauté ${communityId}:`, communityError);
      continue;
    }

    // Récupérer les challenges en cours de l'utilisateur
    const { data: activeChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, title, creator_id, status, challenge_participants!inner(progress)')
      .eq('community_id', communityId)
      .eq('challenge_participants.user_id', userId)
      .eq('challenge_participants.status', 'in_progress')
      .neq('status', 'finished');

    if (challengesError) {
      console.error(`Erreur lors de la récupération des challenges pour ${userId}:`, challengesError);
      continue;
    }

    const challenge = activeChallenges?.[0] || null;
    const progress = challenge?.challenge_participants?.[0]?.progress || 0;

    // Récupérer les tâches en attente pour l'utilisateur
    const { data: tasks, error: tasksError } = await supabase
      .from('challenge_tasks')
      .select('title, deadline, status')
      .eq('assigned_to', userId)
      .eq('status', 'pending');

    if (tasksError) {
      console.error(`Erreur lors de la récupération des tâches pour ${userId}:`, tasksError);
      continue;
    }

    // Calculer le nombre de jours depuis la dernière entrée
    const lastEntryDate = new Date(record.last_entry_at);
    const daysSinceLastEntry = Math.floor((Date.now() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));

    // Générer un rappel
    const reminderResult = await generateReminder(supabase, {
      userId,
      communityId,
      communityName: community.name,
      username: profile.username,
      challengeTitle: challenge?.title || null,
      progress: progress || 0,
      daysSinceLastEntry,
      pendingTasks: tasks || [],
    });

    if ('error' in reminderResult) {
      console.error(`Erreur lors de la génération du rappel pour ${userId}:`, reminderResult.error);
      continue;
    }

    const reminderMessage = reminderResult.data;

    // Préparer l'insertion du rappel
    remindersToInsert.push({
      user_id: userId,
      community_id: communityId,
      challenge_id: challenge?.id || null,
      message: reminderMessage,
      scheduled_at: new Date().toISOString(),
    });
  }

  // 3. Insérer tous les rappels générés
  if (remindersToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('reminders')
      .insert(remindersToInsert);

    if (insertError) {
      console.error('Erreur lors de l\'insertion des rappels:', insertError);
      return { error: "Erreur lors de la sauvegarde des rappels." };
    }
  }

  return { data: { generated: remindersToInsert.length } };
}