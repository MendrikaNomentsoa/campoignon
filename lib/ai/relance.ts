import { createGroqClient, getGroqModel } from './client';
import { SupabaseClient } from '@supabase/supabase-js';

const RELANCE_SYSTEM_PROMPT = `
Tu es le "Co-pilote de Relance", un système qui aide un développeur à reprendre un projet abandonné ou interrompu.

Ton rôle est de générer un "briefing de reprise" en 3 points :

1. **Où le projet s'est arrêté** : Résumé narratif de l'état du projet au moment de l'interruption
2. **État actuel** : Ce qui existe, ce qui fonctionne, ce qui est cassé
3. **3 actions prioritaires** : Les 3 premières choses concrètes à faire pour relancer le projet

Tu peux aussi générer un **récapitulatif d'environnement** (setup dev) pour faciliter la reprise.

Réponds UNIQUEMENT en JSON avec cette structure :
{
  "briefing": {
    "stoppedAt": "Narration de où le projet s'est arrêté (2-3 phrases)",
    "currentState": "État technique actuel (2-3 phrases)",
    "priorityActions": [
      { "step": 1, "action": "Action concrète", "estimatedTime": "15min|1h|2h|...", "motivation": "Pourquoi c'est important et gratifiant" },
      { "step": 2, "action": "...", "estimatedTime": "...", "motivation": "..." },
      { "step": 3, "action": "...", "estimatedTime": "...", "motivation": "..." }
    ]
  },
  "envSetup": {
    "title": "Préparation de l'environnement",
    "steps": ["Étape 1 de setup", "Étape 2 de setup"],
    "quickStart": "Commande ou action pour démarrer rapidement"
  },
  "motivationalHook": "Phrase d'accroche motivante en 1-2 phrases pour inciter à la reprise"
}

Sois spécifique, concret et toujours encourageant. Jamais culpabilisant.
`;

interface RelanceData {
  challenge: {
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    finished_at: string | null;
  };
  tasks: Array<{ title: string; description: string | null; status: string; points: number; deadline: string | null }>;
  participants: Array<{ username: string; progress: number; total_points: number; status: string }>;
  lastActivity: string | null;
  communityName: string;
  entryCount: number;
}

function buildRelancePrompt(data: RelanceData): string {
  let prompt = `Briefing de reprise pour ce projet :\n\n`;
  prompt += `Titre : ${data.challenge.title}\n`;
  if (data.challenge.description) prompt += `Description : ${data.challenge.description}\n`;
  prompt += `Statut : ${data.challenge.status}\n`;
  prompt += `Communauté : ${data.communityName}\n`;
  prompt += `Créé le : ${new Date(data.challenge.created_at).toLocaleDateString()}\n`;
  if (data.lastActivity) prompt += `Dernière activité : ${new Date(data.lastActivity).toLocaleDateString()}\n`;
  else prompt += `Dernière activité : inconnue\n`;
  prompt += `Entrées d'apprentissage liées : ${data.entryCount}\n`;

  const done = data.tasks.filter(t => t.status === 'done');
  const pending = data.tasks.filter(t => t.status === 'pending');
  const overdue = pending.filter(t => t.deadline && new Date(t.deadline) < new Date());

  prompt += `\nTâches terminées (${done.length}) :\n`;
  done.forEach(t => prompt += `  ✅ "${t.title}" (${t.points}pts)\n`);

  prompt += `\nTâches en attente (${pending.length}) :\n`;
  pending.forEach(t => {
    prompt += `  ⏳ "${t.title}" (${t.points}pts)`;
    if (t.deadline) prompt += ` deadline: ${new Date(t.deadline).toLocaleDateString()}`;
    if (overdue.includes(t)) prompt += ` ⚠️ EN RETARD`;
    prompt += `\n`;
  });

  prompt += `\nParticipants :\n`;
  data.participants.forEach(p => {
    prompt += `  - ${p.username}: ${p.progress}%, ${p.total_points}pts (${p.status})\n`;
  });

  return prompt;
}

export async function generateRelanceBriefing(
  supabase: SupabaseClient,
  { challengeId, communityId, userId }: {
    challengeId: string;
    communityId: string;
    userId: string;
  }
) {
  try {
    // 1. Récupérer le challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('title, description, status, created_at, finished_at')
      .eq('id', challengeId)
      .single();

    if (!challenge) return { error: "Projet introuvable." };

    // 2. Communauté
    const { data: community } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    // 3. Tâches
    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, description, status, points, deadline')
      .eq('challenge_id', challengeId);

    // 4. Participants
    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('progress, total_points, status, profiles(username)')
      .eq('challenge_id', challengeId);

    // 5. Dernière activité
    const { data: lastEntry } = await supabase
      .from('learning_entries')
      .select('created_at')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 6. Nombre d'entrées
    const { count: entryCount } = await supabase
      .from('learning_entries')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', communityId);

    const relanceData: RelanceData = {
      challenge,
      tasks: tasks || [],
      participants: (participants || []).map((p: any) => ({
        username: p.profiles?.username || "Anonyme",
        progress: p.progress,
        total_points: p.total_points,
        status: p.status,
      })),
      lastActivity: lastEntry?.created_at || null,
      communityName: community?.name || "Communauté",
      entryCount: entryCount || 0,
    };

    // 7. Appeler l'IA
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: RELANCE_SYSTEM_PROMPT },
        { role: 'user', content: buildRelancePrompt(relanceData) },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer le briefing." };

    let briefing;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      briefing = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      briefing = {
        briefing: {
          stoppedAt: "Le projet a été interrompu.",
          currentState: "En attente de reprise.",
          priorityActions: [
            { step: 1, action: "Revoir le code existant", estimatedTime: "30min", motivation: "Pour reprendre tes marques" },
            { step: 2, action: "Corriger le bug principal", estimatedTime: "1h", motivation: "Pour avancer concrètement" },
            { step: 3, action: "Tester et déployer", estimatedTime: "2h", motivation: "Pour finaliser le projet" },
          ],
        },
        envSetup: { title: "Setup", steps: ["Installer les dépendances"], quickStart: "npm install" },
        motivationalHook: "Ce projet mérite d'être terminé. Tu peux le faire !",
      };
    }

    // 8. Sauvegarder
    const { data: saved, error: saveError } = await supabase
      .from('restart_briefings')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        where_stopped: briefing.briefing?.stoppedAt,
        current_state: briefing.briefing?.currentState,
        priority_actions: briefing.briefing?.priorityActions,
        env_setup: briefing.envSetup?.quickStart,
      })
      .select()
      .single();

    if (saveError) console.error('Erreur sauvegarde briefing:', saveError);

    return { data: { ...briefing, id: saved?.id } };
  } catch (error) {
    console.error('Erreur Relance:', error);
    return { error: "Erreur lors de la génération du briefing." };
  }
}
