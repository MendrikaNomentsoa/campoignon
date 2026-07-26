// lib/ai/prompts.ts

// Le prompt système principal qui définit le rôle et le ton de l'IA
export const SYSTEM_PROMPT = `
Tu es "Compagnon", un assistant bienveillant et encourageant intégré à une application d'apprentissage en communauté.
Ton rôle est d'accompagner les utilisateurs dans leur apprentissage. Tu dois toujours être :
- Encourageant et positif, jamais culpabilisant.
- Concret et spécifique : tu poses des questions de suivi précises basées sur ce que l'utilisateur a partagé.
- Adapté au contexte : tu utilises les informations fournies sur les communautés, les challenges et les tâches pour personnaliser tes réponses.

Les objectifs des challenges sont de motiver les utilisateurs à progresser. Tu dois donc :
1.  **Valider et encourager** : Félicite l'utilisateur pour ses progrès, même petits.
2.  **Proposer des actions** : Suggère des prochaines étapes concrètes.
3.  **Maintenir l'engagement** : Si l'utilisateur est en retard ou bloque, propose des solutions ou ajuste les objectifs.
4.  **Créer du lien communautaire** : Mentionne les autres participants (sans les nommer si ce n'est pas souhaité) pour créer une saine émulation.

Réponds en français, avec un ton chaleureux et humain. Si l'utilisateur te pose une question hors-sujet, redirige-le doucement vers son apprentissage.
`;

/**
 * Formate le contexte utilisateur pour l'IA.
 */
export function formatContextForAI(params: {
  username?: string | null;
  communityName?: string | null;
  challengeTitle?: string | null;
  progress?: number | null;
  totalPoints?: number | null;
  lastEntries?: Array<{ content: string; created_at: string }> | null;
  tasks?: Array<{ title: string; status?: string; deadline?: string | null }> | null;
  leaderboardInfo?: { userPoints: number; otherParticipantsCount: number } | null;
}) {
  let context = "Voici le contexte de l'utilisateur :\n";

  if (params.username) context += `- Utilisateur : ${params.username}\n`;
  if (params.communityName) context += `- Communauté : ${params.communityName}\n`;
  if (params.challengeTitle) context += `- Challenge actif : ${params.challengeTitle}\n`;
  if (params.progress !== null && params.progress !== undefined) context += `- Progression dans le challenge : ${params.progress}%\n`;
  if (params.totalPoints !== null && params.totalPoints !== undefined) context += `- Points totaux : ${params.totalPoints}\n`;

  // Dernières entrées d'apprentissage
  if (params.lastEntries && params.lastEntries.length > 0) {
    context += `- Dernières entrées d'apprentissage :\n`;
    params.lastEntries.forEach(entry => {
      context += `  * "${entry.content}" (posté le ${new Date(entry.created_at).toLocaleDateString()})\n`;
    });
  } else {
    context += `- Pas d'entrées d'apprentissage récentes. L'utilisateur est peut-être en train de débuter.\n`;
  }

  // Tâches en cours
  if (params.tasks && params.tasks.length > 0) {
    context += `- Tâches assignées :\n`;
    params.tasks.forEach(task => {
      const statusEmoji = task.status === 'done' ? '✅' : '⏳';
      context += `  * ${statusEmoji} "${task.title}" (statut: ${task.status})`;
      if (task.deadline) {
        context += `, date limite: ${new Date(task.deadline).toLocaleDateString()}`;
      }
      context += `\n`;
    });
  }

  // Classement du challenge
  if (params.leaderboardInfo) {
    context += `- Classement dans le challenge : ${params.leaderboardInfo.userPoints} points, sur ${params.leaderboardInfo.otherParticipantsCount + 1} participants (dont ${params.leaderboardInfo.otherParticipantsCount} autres).\n`;
  }

  return context;
}

/**
 * Génère un prompt pour la création de rappels.
 */
export function getReminderPrompt(params: {
  username: string;
  communityName: string;
  challengeTitle?: string | null;
  progress?: number | null;
  tasks?: Array<{ title: string; status: string; deadline?: string | null }> | null;
  daysSinceLastEntry?: number | null;
}) {
  let prompt = `Tu es un assistant qui génère des rappels personnalisés et encourageants. Génère un message court (moins de 150 caractères) pour un utilisateur d'une communauté d'apprentissage.`;
  prompt += `\nUtilisateur : ${params.username}`;
  prompt += `\nCommunauté : ${params.communityName}`;
  if (params.challengeTitle) prompt += `\nChallenge : ${params.challengeTitle}`;
  if (params.progress !== null && params.progress !== undefined) prompt += `\nProgression : ${params.progress}%`;
  if (params.daysSinceLastEntry !== null && params.daysSinceLastEntry !== undefined) {
    prompt += `\nDernière activité : il y a ${params.daysSinceLastEntry} jours.`;
  }

  if (params.tasks && params.tasks.length > 0) {
    prompt += `\nTâches en cours : `;
    const pendingTasks = params.tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length > 0) {
      prompt += pendingTasks.map(t => `"${t.title}"`).join(', ');
    } else {
      prompt += `Aucune tâche en attente. Bravo !`;
    }
  }

  prompt += `\nLe message doit être encourageant, spécifique et inciter à l'action. Il ne doit pas être générique. Exemple : "Hé toi ! Comment avance ton projet de clone Trello ? N'oublie pas, chaque petit pas compte ! 💪"`;
  return prompt;
}