import { createGroqClient, getGroqModel } from './client';
import { SupabaseClient } from '@supabase/supabase-js';

const HERITAGE_SYSTEM_PROMPT = `
Tu es le "Générateur de Cartes d'Héritage", un système de game design qui transforme des projets informatiques abandonnés ou en cours en contenu interactif et engageant.

Ton rôle est de transformer un projet en une "carte de quête" RPG/gameifiée avec :

1. **Type de carte** : quest (quête principale), relic (relique/arche), friche (projet abandonné), boss (défi majeur)
2. **Titre épique** : un nom accrocheur pour le projet
3. **Description narrative** : un lore court qui raconte l'histoire du projet
4. **Objectifs de quête** : les étapes clés transformées en objectifs de jeu
5. **Boss final** : le plus grand défi technique restant
6. **Récompense preview** : ce que le joueur gagnera en finissant

Réponds UNIQUEMENT en JSON avec cette structure :
{
  "cardType": "quest" | "relic" | "friche" | "boss",
  "title": "Titre épique du projet",
  "description": "Lore narratif en 2-3 phrases",
  "objectives": [
    { "title": "Objectif 1", "difficulty": "easy|medium|hard", "completed": false }
  ],
  "bossChallenge": "Description du boss final",
  "rewardPreview": "Récompense en 1 phrase",
  "lore": "Histoire complète du projet en 3-4 phrases"
}

Sois créatif et inspirant. Transforme du code en aventure.
`;

interface ProjectData {
  title: string;
  description: string | null;
  status: string;
  tasks: Array<{ title: string; description: string | null; status: string; points: number }>;
  participants: number;
  communityName: string;
  createdAt: string;
  finishedAt: string | null;
}

function buildHeritagePrompt(data: ProjectData): string {
  let prompt = `Transforme ce projet en carte d'héritage :\n\n`;
  prompt += `Titre : ${data.title}\n`;
  if (data.description) prompt += `Description : ${data.description}\n`;
  prompt += `Statut : ${data.status}\n`;
  prompt += `Communauté : ${data.communityName}\n`;
  prompt += `Créé le : ${new Date(data.createdAt).toLocaleDateString()}\n`;
  prompt += `Participants : ${data.participants}\n`;

  prompt += `\nTâches (${data.tasks.length}) :\n`;
  data.tasks.forEach(t => {
    prompt += `  - "${t.title}" (${t.status}, ${t.points}pts)${t.description ? `: ${t.description.substring(0, 80)}` : ""}\n`;
  });

  const done = data.tasks.filter(t => t.status === 'done').length;
  const total = data.tasks.length;
  prompt += `\nProgression : ${done}/${total} tâches terminées (${total > 0 ? Math.round(done / total * 100) : 0}%)\n`;

  return prompt;
}

export async function generateHeritageCard(
  supabase: SupabaseClient,
  { challengeId, communityId }: { challengeId: string; communityId: string }
) {
  try {
    // 1. Récupérer les données du challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('title, description, status, created_at, finished_at, community_id')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) return { error: "Projet introuvable." };

    // 2. Récupérer la communauté
    const { data: community } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    // 3. Récupérer les tâches
    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, description, status, points')
      .eq('challenge_id', challengeId);

    // 4. Compter les participants
    const { count: participantCount } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId);

    const projectData: ProjectData = {
      title: challenge.title,
      description: challenge.description,
      status: challenge.status,
      tasks: tasks || [],
      participants: participantCount || 0,
      communityName: community?.name || "Communauté",
      createdAt: challenge.created_at,
      finishedAt: challenge.finished_at,
    };

    // 5. Appeler l'IA
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: HERITAGE_SYSTEM_PROMPT },
        { role: 'user', content: buildHeritagePrompt(projectData) },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer la carte." };

    let card;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      card = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      card = {
        cardType: challenge.status === 'finished' ? 'relic' : challenge.status === 'open' ? 'quest' : 'friche',
        title: challenge.title,
        description: challenge.description || "Un projet qui attend d'être complété.",
        objectives: (tasks || []).map(t => ({ title: t.title, difficulty: 'medium', completed: t.status === 'done' })),
        bossChallenge: "Finaliser et déployer le projet",
        rewardPreview: "Satisfaction + points de bravoure",
        lore: `Ce projet a été lancé dans la communauté ${community?.name || ""}. Il a rassemblé ${participantCount || 0} participants.`,
      };
    }

    // 6. Sauvegarder la carte
    const progress = tasks && tasks.length > 0
      ? Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100)
      : 0;

    const { data: savedCard, error: saveError } = await supabase
      .from('project_cards')
      .insert({
        challenge_id: challengeId,
        community_id: communityId,
        card_type: card.cardType,
        title: card.title,
        description: card.description,
        progress,
        boss_challenge: card.bossChallenge,
        quest_objectives: card.objectives,
        lore: card.lore,
        reward_preview: card.rewardPreview,
      })
      .select()
      .single();

    if (saveError) console.error('Erreur sauvegarde carte:', saveError);

    return { data: { ...card, progress, id: savedCard?.id } };
  } catch (error) {
    console.error('Erreur Heritage:', error);
    return { error: "Erreur lors de la génération de la carte." };
  }
}

export async function getHeritageCards(
  supabase: SupabaseClient,
  { communityId }: { communityId: string }
) {
  const { data, error } = await supabase
    .from('project_cards')
    .select('*')
    .eq('community_id', communityId)
    .order('generated_at', { ascending: false });

  if (error) return { error: error.message };
  return { data };
}
