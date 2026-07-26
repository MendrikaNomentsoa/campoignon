import { createGroqClient, getGroqModel } from './client';
import { SupabaseClient } from '@supabase/supabase-js';

const MEDIATOR_SYSTEM_PROMPT = `
Tu es le "Médiateur d'Apprentissage", un système qui connecte les erreurs passées avec les problèmes actuels dans une communauté de développeurs.

Tes deux rôles principaux :

**1. Matching sémantique d'erreurs :**
Quand un utilisateur documente une erreur ou un blocage, tu cherches dans les "mémoires d'erreurs" existantes pour trouver des solutions similaires. Tu donnes :
- La référence à la solution trouvée
- Un résumé de la démarche de résolution
- Un lien de pertinence (high/medium/low)

**2. Génération de Post-Mortems :**
Quand un projet est abandonné ou terminé, tu analyses l'historique pour extraire :
- Ce qui a marché (facteurs de succès)
- Ce qui n'a pas marché (obstacles)
- Les leçons apprises (fiches pratiques)
- Des recommandations pour la communauté

Réponds UNIQUEMENT en JSON.

Pour le matching :
{
  "matches": [
    {
      "memoryId": "id de la mémoire correspondante",
      "relevance": "high|medium|low",
      "summary": "Résumé en 2 phrases de la solution",
      "directLink": "section ou commande clé pour résoudre"
    }
  ],
  "aiSuggestion": "Si aucune mémoire ne correspond, ta propre suggestion en 3-4 phrases"
}

Pour le post-mortem :
{
  "whatWorked": "Ce qui a marché, en 2-3 phrases",
  "whatFailed": "Ce qui n'a pas marché, en 2-3 phrases",
  "lessons": [
    { "title": "Leçon 1", "detail": "Détail pratique", "category": "technique|processus|communication" }
  ],
  "fullReport": "Rapport complet en 5-6 phrases"
}
`;

export async function matchError(
  supabase: SupabaseClient,
  { userId, communityId, errorDescription }: {
    userId: string;
    communityId: string;
    errorDescription: string;
  }
) {
  try {
    // 1. Récupérer les mémoires d'erreurs existantes
    const { data: memories } = await supabase
      .from('error_memories')
      .select('id, error_type, error_summary, resolution, context_tags')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(20);

    // 2. Récupérer les post-mortems pertinents
    const { data: postMortems } = await supabase
      .from('post_mortems')
      .select('id, what_worked, what_failed, lessons_learned')
      .eq('community_id', communityId)
      .order('generated_at', { ascending: false })
      .limit(5);

    // 3. Construire le prompt
    let prompt = `Un utilisateur rencontre ce problème :\n"${errorDescription}"\n\n`;

    if (memories && memories.length > 0) {
      prompt += `Mémoires d'erreurs existantes dans la communauté :\n`;
      memories.forEach((m, i) => {
        prompt += `  ${i + 1}. [${m.error_type}] ${m.error_summary}\n     Solution : ${m.resolution.substring(0, 150)}\n`;
      });
    } else {
      prompt += `Aucune mémoire d'erreur existante.\n`;
    }

    if (postMortems && postMortems.length > 0) {
      prompt += `\nPost-mortems passés :\n`;
      postMortems.forEach((pm, i) => {
        prompt += `  ${i + 1}. Ce qui a marché : ${(pm.what_worked || "").substring(0, 80)}\n`;
        prompt += `     Ce qui a échoué : ${(pm.what_failed || "").substring(0, 80)}\n`;
      });
    }

    // 4. Appeler l'IA
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: MEDIATOR_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu analyser le problème." };

    let result;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      result = { matches: [], aiSuggestion: raw };
    }

    // 5. Sauvegarder l'erreur comme mémoire pour les prochaines fois
    await supabase.from('error_memories').insert({
      user_id: userId,
      community_id: communityId,
      error_type: 'documented',
      error_summary: errorDescription.substring(0, 200),
      resolution: result.aiSuggestion || "En attente de résolution",
      context_tags: [],
    });

    return { data: result };
  } catch (error) {
    console.error('Erreur Mediator matching:', error);
    return { error: "Erreur lors de l'analyse du problème." };
  }
}

export async function generatePostMortem(
  supabase: SupabaseClient,
  { challengeId, communityId, generatedBy }: {
    challengeId: string;
    communityId: string;
    generatedBy: string;
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

    // 2. Récupérer les tâches
    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, status, completed_at, deadline, points')
      .eq('challenge_id', challengeId);

    // 3. Récupérer les participants et leur progression
    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('user_id, progress, total_points, status, profiles(username)')
      .eq('challenge_id', challengeId);

    // 4. Récupérer les entrées d'apprentissage liées
    const { data: entries } = await supabase
      .from('learning_entries')
      .select('content, created_at')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 5. Construire le prompt
    let prompt = `Génère un post-mortem pour ce projet :\n\n`;
    prompt += `Titre : ${challenge.title}\n`;
    if (challenge.description) prompt += `Description : ${challenge.description}\n`;
    prompt += `Statut final : ${challenge.status}\n`;
    prompt += `Durée : ${new Date(challenge.created_at).toLocaleDateString()} → ${challenge.finished_at ? new Date(challenge.finished_at).toLocaleDateString() : "en cours"}\n`;

    prompt += `\nTâches (${tasks?.length || 0}) :\n`;
    tasks?.forEach(t => {
      prompt += `  - "${t.title}" [${t.status}] (${t.points}pts)`;
      if (t.completed_at) prompt += ` terminé le ${new Date(t.completed_at).toLocaleDateString()}`;
      if (t.deadline && t.status === 'pending') prompt += ` ⚠️ deadline dépassée`;
      prompt += `\n`;
    });

    prompt += `\nParticipants (${participants?.length || 0}) :\n`;
    participants?.forEach((p: any) => {
      prompt += `  - ${p.profiles?.username || "Anonyme"}: ${p.progress}% progression, ${p.total_points} points, statut: ${p.status}\n`;
    });

    // 6. Appeler l'IA
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: MEDIATOR_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer le post-mortem." };

    let postMortem;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      postMortem = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      postMortem = {
        whatWorked: "Analyse en cours...",
        whatFailed: "Analyse en cours...",
        lessons: [],
        fullReport: raw,
      };
    }

    // 7. Sauvegarder
    const { data: saved, error: saveError } = await supabase
      .from('post_mortems')
      .insert({
        challenge_id: challengeId,
        community_id: communityId,
        generated_by: generatedBy,
        status: challenge.status,
        what_worked: postMortem.whatWorked,
        what_failed: postMortem.whatFailed,
        lessons_learned: postMortem.lessons,
        full_report: postMortem.fullReport,
      })
      .select()
      .single();

    if (saveError) console.error('Erreur sauvegarde post-mortem:', saveError);

    return { data: { ...postMortem, id: saved?.id } };
  } catch (error) {
    console.error('Erreur Post-Mortem:', error);
    return { error: "Erreur lors de la génération du post-mortem." };
  }
}
