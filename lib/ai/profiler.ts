import { createGroqClient, getGroqModel } from './client';
import { SupabaseClient } from '@supabase/supabase-js';

const PROFILER_SYSTEM_PROMPT = `
Tu es le "Profiler d'Élan", un système d'analyse comportementale pour une plateforme d'apprentissage en communauté.

Ton rôle est d'analyser les habitudes de travail d'un développeur pour :
1. **Détecter les patterns de décrochage** : sessions qui se raccourcissent, baisse d'activité, tâches en souffrance
2. **Anticiper l'abandon** : identifier les signes avant-coureurs (recherches vagues, tâches bloquées longtemps)
3. **Suggérer des adaptations** : découper les tâches complexes, proposer des micro-victoires

Tu dois répondre UNIQUEMENT en JSON avec cette structure :
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "trend": "improving" | "stable" | "declining" | "spiking",
  "analysis": {
    "sessionPattern": "description du pattern observé",
    "motivationIndicators": ["indicateur1", "indicateur2"],
    "blockagePoints": ["blocage1"]
  },
  "recommendation": "Conseil concret et encourageant en 2-3 phrases",
  "microTask": {
    "title": "Titre d'une micro-tâche gratifiante",
    "description": "Description courte et motivante",
    "estimatedMinutes": 15
  }
}

Réponds toujours en JSON valide. Sois bienveillant, jamais culpabilisant.
`;

interface ActivityData {
  sessions: Array<{
    session_start: string;
    session_end: string | null;
    entries_created: number;
    tasks_completed: number;
    duration_minutes: number | null;
  }>;
  recentEntries: Array<{ content: string; created_at: string }>;
  pendingTasks: Array<{ title: string; status: string; deadline: string | null }>;
  completedTasks: Array<{ title: string; completed_at: string | null }>;
  daysSinceLastEntry: number;
  totalEntries: number;
  totalTasksCompleted: number;
}

function buildProfilerPrompt(data: ActivityData): string {
  let prompt = "Analyse le comportement de cet utilisateur :\n\n";

  prompt += `Sessions récentes (${data.sessions.length}) :\n`;
  data.sessions.slice(0, 10).forEach((s, i) => {
    const dur = s.duration_minutes ? `${Math.round(s.duration_minutes)}min` : "en cours";
    prompt += `  ${i + 1}. ${new Date(s.session_start).toLocaleDateString()} - ${dur}, ${s.entries_created} entrées, ${s.tasks_completed} tâches\n`;
  });

  prompt += `\nTâches en attente : ${data.pendingTasks.length}\n`;
  data.pendingTasks.slice(0, 5).forEach(t => {
    const overdue = t.deadline && new Date(t.deadline) < new Date();
    prompt += `  - "${t.title}"${overdue ? " ⚠️ EN RETARD" : ""}\n`;
  });

  prompt += `\nTâches terminées : ${data.totalTasksCompleted}\n`;
  prompt += `Entrées totales : ${data.totalEntries}\n`;
  prompt += `Jours depuis dernière activité : ${data.daysSinceLastEntry}\n`;

  if (data.recentEntries.length > 0) {
    prompt += `\nDernières entrées :\n`;
    data.recentEntries.slice(0, 3).forEach(e => {
      prompt += `  - "${e.content.substring(0, 100)}" (${new Date(e.created_at).toLocaleDateString()})\n`;
    });
  }

  return prompt;
}

export async function analyzeBehavior(
  supabase: SupabaseClient,
  { userId, communityId }: { userId: string; communityId: string }
) {
  try {
    // 1. Récupérer les sessions récentes (14 derniers jours)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('session_start, session_end, entries_created, tasks_completed, duration_minutes')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .gte('session_start', twoWeeksAgo.toISOString())
      .order('session_start', { ascending: false });

    // 2. Dernières entrées d'apprentissage
    const { data: recentEntries } = await supabase
      .from('learning_entries')
      .select('content, created_at')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Calculer jours depuis dernière activité
    let daysSinceLastEntry = 30;
    if (recentEntries && recentEntries.length > 0) {
      const lastEntryDate = new Date(recentEntries[0].created_at);
      daysSinceLastEntry = Math.floor((Date.now() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // 4. Tâches en attente et terminées
    const { data: pendingTasks } = await supabase
      .from('challenge_tasks')
      .select('title, status, deadline')
      .eq('assigned_to', userId)
      .eq('status', 'pending');

    const { data: completedTasks } = await supabase
      .from('challenge_tasks')
      .select('title, completed_at')
      .eq('assigned_to', userId)
      .eq('status', 'done');

    // 5. Compter les entrées totales
    const { count: totalEntries } = await supabase
      .from('learning_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('community_id', communityId);

    const activityData: ActivityData = {
      sessions: sessions || [],
      recentEntries: recentEntries || [],
      pendingTasks: pendingTasks || [],
      completedTasks: completedTasks || [],
      daysSinceLastEntry,
      totalEntries: totalEntries || 0,
      totalTasksCompleted: completedTasks?.length || 0,
    };

    // 6. Appeler l'IA pour l'analyse
    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: PROFILER_SYSTEM_PROMPT },
        { role: 'user', content: buildProfilerPrompt(activityData) },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer d'analyse." };

    // Parse le JSON de réponse
    let analysis;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    } catch {
      analysis = {
        riskLevel: daysSinceLastEntry > 7 ? 'high' : daysSinceLastEntry > 3 ? 'medium' : 'low',
        trend: 'stable',
        analysis: { sessionPattern: raw, motivationIndicators: [], blockagePoints: [] },
        recommendation: raw,
        microTask: null,
      };
    }

    // 7. Sauvegarder le profil comportemental
    const { error: saveError } = await supabase
      .from('behavior_profiles')
      .insert({
        user_id: userId,
        community_id: communityId,
        risk_level: analysis.riskLevel,
        trend: analysis.trend,
        avg_session_duration: activityData.sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / Math.max(activityData.sessions.length, 1),
        avg_entries_per_week: activityData.totalEntries / 2,
        days_since_last_entry: daysSinceLastEntry,
        analysis: analysis.analysis,
        recommendation: analysis.recommendation,
      });

    if (saveError) console.error('Erreur sauvegarde profil:', saveError);

    return { data: analysis };
  } catch (error) {
    console.error('Erreur Profiler:', error);
    return { error: "Erreur lors de l'analyse comportementale." };
  }
}

export async function getProfilerHistory(
  supabase: SupabaseClient,
  { userId, communityId }: { userId: string; communityId: string }
) {
  const { data, error } = await supabase
    .from('behavior_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .order('analyzed_at', { ascending: false })
    .limit(10);

  if (error) return { error: error.message };
  return { data };
}
