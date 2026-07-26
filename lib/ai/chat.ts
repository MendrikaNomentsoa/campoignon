// lib/ai/chat.ts
import { createGroqClient, getGroqModel } from './client';
import { SYSTEM_PROMPT, formatContextForAI } from './prompts';
import { SupabaseClient } from '@supabase/supabase-js';

// Interface pour les données nécessaires à la conversation
export interface ChatContext {
  userId: string;
  communityId: string;
  challengeId?: string | null;
  message: string;
}

export async function generateChatResponse(
  supabase: SupabaseClient,
  { userId, communityId, challengeId, message }: ChatContext
) {
  try {
    // 1. Récupérer toutes les données nécessaires depuis Supabase

    // -- Récupérer l'utilisateur et son profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return { error: "Impossible de récupérer vos informations." };
    }

    // -- Récupérer la communauté
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    if (communityError) {
      console.error('Erreur lors de la récupération de la communauté:', communityError);
      return { error: "Impossible de récupérer les informations de la communauté." };
    }

    // -- Récupérer les dernières entrées d'apprentissage
    const { data: lastEntries, error: entriesError } = await supabase
      .from('learning_entries')
      .select('content, created_at')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (entriesError) {
      console.error('Erreur lors de la récupération des entrées:', entriesError);
      // On continue sans les entrées
    }

    // -- Récupérer les informations du challenge (si un challenge est en cours)
    let challengeData = null;
    let participantData = null;
    let tasksData = null;
    let leaderboardInfo = null;

    if (challengeId) {
      // Informations sur le challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('title, community_id, creator_id')
        .eq('id', challengeId)
        .single();

      if (!challengeError && challenge) {
        challengeData = challenge;

        // Progression du participant
        const { data: participant, error: participantError } = await supabase
          .from('challenge_participants')
          .select('progress, total_points, status')
          .eq('challenge_id', challengeId)
          .eq('user_id', userId)
          .single();

        if (!participantError && participant) {
          participantData = participant;

          // Récupérer le nombre d'autres participants
          const { count, error: countError } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challengeId)
            .neq('user_id', userId);

          if (!countError && count !== null) {
            leaderboardInfo = {
              userPoints: participant.total_points || 0,
              otherParticipantsCount: count,
            };
          }
        }

        // Tâches du challenge assignées à l'utilisateur
        const { data: tasks, error: tasksError } = await supabase
          .from('challenge_tasks')
          .select('title, status, deadline')
          .eq('challenge_id', challengeId)
          .eq('assigned_to', userId)
          .order('created_at', { ascending: true });

        if (!tasksError && tasks) {
          tasksData = tasks;
        }
      }
    }

    // 2. Construire le contexte pour l'IA
    const contextString = formatContextForAI({
      username: profile?.username,
      communityName: community?.name,
      challengeTitle: challengeData?.title,
      progress: participantData?.progress,
      totalPoints: participantData?.total_points,
      lastEntries: lastEntries || [],
      tasks: tasksData || [],
      leaderboardInfo: leaderboardInfo || undefined,
    });

    // 3. Appeler l'API Groq
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Contexte :\n${contextString}\n\nQuestion de l'utilisateur : ${message}` },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = chatResponse.choices?.[0]?.message?.content;

    if (!aiMessage) {
      console.error('Erreur: Aucun message de l\'IA généré.');
      return { error: "L'IA n'a pas pu générer de réponse. Veuillez réessayer." };
    }

    // 4. Sauvegarder l'échange dans la base de données
    const messagesToInsert = [
      {
        user_id: userId,
        community_id: communityId,
        challenge_id: challengeId,
        role: 'user',
        content: message,
      },
      {
        user_id: userId,
        community_id: communityId,
        challenge_id: challengeId,
        role: 'assistant',
        content: aiMessage,
      },
    ];

    const { error: saveError } = await supabase
      .from('ai_conversations')
      .insert(messagesToInsert);

    if (saveError) {
      console.error('Erreur lors de la sauvegarde de la conversation:', saveError);
      // L'échec de la sauvegarde ne doit pas bloquer la réponse
    }

    return { data: aiMessage };
  } catch (error) {
    console.error('Erreur dans generateChatResponse:', error);
    return { error: "Une erreur est survenue lors de la communication avec l'IA." };
  }
}