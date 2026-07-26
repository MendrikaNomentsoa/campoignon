import { createGroqClient, getGroqModel } from './client';
import { SupabaseClient } from '@supabase/supabase-js';

const PROJECT_AI_SYSTEM_PROMPT = `
Tu es le Compagnon, un assistant bienveillant pour des créateurs de projets dans une communauté de développement.
Tu es toujours chaleureux, jamais culpabilisant. Tu parles en français avec un ton amical et motivant.
Tu aides les équipes à structurer, lancer et mener à bien leurs projets.
Tu dois toujours répondre UNIQUEMENT en JSON valide avec la structure demandée.
Pas de texte avant ou après le JSON.
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseAIJson<T>(raw: string): T | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as T;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function extractExistingDescription(description: string | null): string {
  if (!description) return '';
  const markers = ['__AI_INIT__', '__AI_PITCH__', '__AI_README__', '__AI_RESOURCES__', '__AI_HERITAGE__'];
  let clean = description;
  for (const marker of markers) {
    const idx = clean.indexOf(marker);
    if (idx !== -1) {
      const endIdx = clean.indexOf('__AI_', idx + marker.length);
      clean = endIdx !== -1 ? clean.substring(0, idx) + clean.substring(endIdx) : clean.substring(0, idx);
    }
  }
  return clean.trim();
}

function buildDescriptionWithAI(originalDesc: string | null, ...prefixes: string[]): string {
  const clean = extractExistingDescription(originalDesc);
  return clean + '\n' + prefixes.join('\n');
}

// ── 1. initProjectAI ─────────────────────────────────────────────────────────

interface InitRoadmapItem {
  day: number;
  title: string;
  tasks: string[];
}

interface InitTechSpecs {
  stack: string[];
  architecture: string;
  tools: string[];
}

interface InitProjectResult {
  roadmap: InitRoadmapItem[];
  techSpecs: InitTechSpecs;
  quickWin: string;
}

export async function initProjectAI(
  supabase: SupabaseClient,
  { projectId, description, resources }: { projectId: string; description?: string; resources?: any[] }
) {
  try {
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, description, community_id')
      .eq('id', projectId)
      .single();

    if (challengeError || !challenge) return { error: "Projet introuvable." };

    let prompt = `Initialise ce projet :\n\n`;
    prompt += `Titre : ${challenge.title}\n`;
    if (description) prompt += `Description fournie : ${description}\n`;
    if (challenge.description) prompt += `Description existante : ${challenge.description.substring(0, 300)}\n`;
    if (resources && resources.length > 0) {
      prompt += `Ressources disponibles :\n`;
      resources.forEach((r: any) => {
        prompt += `  - ${r.title || r.name || r.url || JSON.stringify(r)}\n`;
      });
    }
    prompt += `\nGénère :\n`;
    prompt += `1. Un "roadmap" : un tableau de 5 à 7 jours (Jour 1, Jour 2...) avec pour chaque jour un titre et une liste de tâches concrètes.\n`;
    prompt += `2. Des "techSpecs" : stack technique recommandée, architecture, et outils.\n`;
    prompt += `3. Un "quickWin" : la première tâche de 15 minutes pour obtenir un résultat immédiat et garder le momentum.\n`;

    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: PROJECT_AI_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu initialiser le projet." };

    const result = parseAIJson<InitProjectResult>(raw);
    if (!result) return { error: "L'IA a retourné une réponse invalide." };

    const aiPayload = JSON.stringify({
      roadmap: result.roadmap || [],
      techSpecs: result.techSpecs || { stack: [], architecture: '', tools: [] },
      quickWin: result.quickWin || '',
    });

    const newDescription = buildDescriptionWithAI(
      challenge.description,
      `__AI_INIT__${aiPayload}__AI_INIT__`
    );

    await supabase
      .from('challenges')
      .update({ description: newDescription })
      .eq('id', projectId);

    return { data: result };
  } catch (error) {
    console.error('Erreur initProjectAI:', error);
    return { error: "Erreur lors de l'initialisation IA du projet." };
  }
}

// ── 2. generateProjectAI ─────────────────────────────────────────────────────

interface ProjectPitch {
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
}

interface SuggestedResource {
  title: string;
  url: string;
  type: 'tutorial' | 'github' | 'docs' | 'video';
}

interface GenerateProjectResult {
  pitch: ProjectPitch;
  readme: string;
  suggestedResources: SuggestedResource[];
}

export async function generateProjectAI(
  supabase: SupabaseClient,
  { projectId }: { projectId: string }
) {
  try {
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, description, status, community_id, created_at')
      .eq('id', projectId)
      .single();

    if (challengeError || !challenge) return { error: "Projet introuvable." };

    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, description, status, points')
      .eq('challenge_id', projectId);

    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('progress, total_points, status, profiles(username)')
      .eq('challenge_id', projectId);

    const { data: community } = await supabase
      .from('communities')
      .select('name')
      .eq('id', challenge.community_id)
      .single();

    const doneTasks = tasks?.filter(t => t.status === 'done') || [];
    const totalTasks = tasks?.length || 0;

    let prompt = `Génère la présentation complète de ce projet :\n\n`;
    prompt += `Titre : ${challenge.title}\n`;
    if (challenge.description) prompt += `Description : ${challenge.description.substring(0, 500)}\n`;
    prompt += `Statut : ${challenge.status}\n`;
    prompt += `Communauté : ${community?.name || "Communauté"}\n`;
    prompt += `Créé le : ${new Date(challenge.created_at).toLocaleDateString()}\n`;
    prompt += `Progression : ${doneTasks.length}/${totalTasks} tâches terminées\n`;

    prompt += `\nTâches :\n`;
    tasks?.forEach(t => {
      prompt += `  - "${t.title}" [${t.status}] (${t.points}pts)${t.description ? `: ${t.description.substring(0, 100)}` : ''}\n`;
    });

    prompt += `\nParticipants (${participants?.length || 0}) :\n`;
    participants?.forEach((p: any) => {
      prompt += `  - ${p.profiles?.username || "Anonyme"}: ${p.progress}%\n`;
    });

    prompt += `\nGénère :\n`;
    prompt += `1. Un "pitch" avec : title, tagline (phrase d'accroche), description (paragraphe), highlights (3-5 points forts)\n`;
    prompt += `2. Un "readme" : contenu complet au format Markdown d'un fichier README.md pour ce projet\n`;
    prompt += `3. Des "suggestedResources" : 5 ressources pertinentes (tutoriels, docs, GitHub, vidéos) avec title, url, type\n`;

    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: PROJECT_AI_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer la présentation." };

    const result = parseAIJson<GenerateProjectResult>(raw);
    if (!result) return { error: "L'IA a retourné une réponse invalide." };

    const pitchPayload = JSON.stringify(result.pitch || { title: challenge.title, tagline: '', description: '', highlights: [] });
    const readmePayload = result.readme || '';
    const resourcesPayload = JSON.stringify(result.suggestedResources || []);

    const newDescription = buildDescriptionWithAI(
      challenge.description,
      `__AI_PITCH__${pitchPayload}__AI_PITCH__`,
      `__AI_README__${readmePayload}__AI_README__`,
      `__AI_RESOURCES__${resourcesPayload}__AI_RESOURCES__`
    );

    await supabase
      .from('challenges')
      .update({ description: newDescription })
      .eq('id', projectId);

    return { data: result };
  } catch (error) {
    console.error('Erreur generateProjectAI:', error);
    return { error: "Erreur lors de la génération de la présentation." };
  }
}

// ── 3. generateProgressLog ───────────────────────────────────────────────────

interface ProgressLogResult {
  log: string;
}

export async function generateProgressLog(
  supabase: SupabaseClient,
  { projectId, activity }: { projectId: string; activity?: string }
) {
  try {
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, description, status, created_at, updated_at')
      .eq('id', projectId)
      .single();

    if (challengeError || !challenge) return { error: "Projet introuvable." };

    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, status, points, completed_at')
      .eq('challenge_id', projectId);

    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('progress, total_points, status, profiles(username)')
      .eq('challenge_id', projectId);

    const doneTasks = tasks?.filter(t => t.status === 'done') || [];
    const totalTasks = tasks?.length || 0;

    let prompt = `Génère un journal de progression pour ce projet :\n\n`;
    prompt += `Titre : ${challenge.title}\n`;
    prompt += `Statut : ${challenge.status}\n`;
    prompt += `Tâches terminées : ${doneTasks.length}/${totalTasks}\n`;

    if (doneTasks.length > 0) {
      prompt += `\nTâches complétées :\n`;
      doneTasks.forEach(t => {
        prompt += `  ✅ "${t.title}" (${t.points}pts)\n`;
      });
    }

    const pendingTasks = tasks?.filter(t => t.status !== 'done') || [];
    if (pendingTasks.length > 0) {
      prompt += `\nTâches restantes :\n`;
      pendingTasks.forEach(t => {
        prompt += `  ⏳ "${t.title}" (${t.points}pts)\n`;
      });
    }

    prompt += `\nParticipants : ${participants?.length || 0}\n`;

    if (activity) {
      prompt += `\nActivité récente à mentionner : ${activity}\n`;
    }

    prompt += `\nGénère un court résumé de progression (2-3 phrases max) en français, ton chaleureux comme un compagnon bienveillant. Mentionne le nom du projet, le nombre de tâches complétées, et le prochain objectif. Exemple de ton : "Cette semaine, 3 tâches ont été complétées sur 'gestion d'aide'. Le module d'authentification est opérationnel ! Prochain objectif : l'API de gestion des utilisateurs."\n`;
    prompt += `Réponds avec un objet JSON : { "log": "ton message ici" }`;

    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: PROJECT_AI_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer le journal." };

    const result = parseAIJson<ProgressLogResult>(raw);
    if (result) return { data: result };

    return { data: { log: raw.replace(/^["']|["']$/g, '').trim() } };
  } catch (error) {
    console.error('Erreur generateProgressLog:', error);
    return { error: "Erreur lors de la génération du journal de progression." };
  }
}

// ── 4. detectBlockage ────────────────────────────────────────────────────────

interface BlockageResult {
  nudgeMessage: string;
  microObjective: string;
  encouragement: string;
}

export async function detectBlockage(
  supabase: SupabaseClient,
  { projectId }: { projectId: string }
) {
  try {
    const challenge = await supabase
      .from('challenges')
      .select('id, title, description, status, created_at')
      .eq('id', projectId)
      .single();

    if (challenge.error || !challenge.data) return { error: "Projet introuvable." };
    const data = challenge.data;

    const createdAt = new Date(data.created_at);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate < 3) {
      return { data: null };
    }

    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, description, status, points')
      .eq('challenge_id', projectId);

    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('progress, total_points, status, profiles(username)')
      .eq('challenge_id', projectId);

    const doneTasks = tasks?.filter(t => t.status === 'done') || [];
    const totalTasks = tasks?.length || 0;

    let prompt = `Ce projet semble bloqué. Génère un message de relance bienveillant.\n\n`;
    prompt += `Titre : ${data.title}\n`;
    prompt += `Statut : ${data.status}\n`;
    prompt += `Dernière mise à jour : ${daysSinceUpdate} jours\n`;
    prompt += `Progression : ${doneTasks.length}/${totalTasks} tâches terminées\n`;
    prompt += `Participants : ${participants?.length || 0}\n`;

    const pendingTasks = tasks?.filter(t => t.status !== 'done') || [];
    if (pendingTasks.length > 0) {
      prompt += `\nTâches en attente :\n`;
      pendingTasks.slice(0, 5).forEach(t => {
        prompt += `  - "${t.title}" (${t.points}pts)\n`;
      });
    }

    prompt += `\nGénère :\n`;
    prompt += `1. "nudgeMessage" : un message chaleureux, non culpabilisant, pour relancer (ex: "Tu stagnes sur 'gestion d'aide' ? Voici un micro-objectif de 15 minutes pour relancer la machine aujourd'hui.")\n`;
    prompt += `2. "microObjective" : une tâche concrète de 15 minutes qu'on peut faire maintenant\n`;
    prompt += `3. "encouragement" : une courte phrase motivante\n`;

    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: PROJECT_AI_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer le message de relance." };

    const result = parseAIJson<BlockageResult>(raw);
    if (result) return { data: result };

    return {
      data: {
        nudgeMessage: `Il semble que "${data.title}" attende un peu trop. Pas de souci, on reprend ensemble !`,
        microObjective: `Consacre 15 minutes à la prochaine tâche en attente pour relancer le momentum.`,
        encouragement: "Chaque petit pas compte. Tu as déjà fait les plus difficiles !",
      },
    };
  } catch (error) {
    console.error('Erreur detectBlockage:', error);
    return { error: "Erreur lors de la détection de blocage." };
  }
}

// ── 5. generateHeritageProject ───────────────────────────────────────────────

interface HeritageProjectResult {
  summary: string;
  whatWorked: string[];
  whatDidntWork: string[];
  remainingTasks: string[];
  handoffNotes: string;
  techState: string;
}

export async function generateHeritageProject(
  supabase: SupabaseClient,
  { projectId, reason }: { projectId: string; reason?: string }
) {
  try {
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, description, status, created_at, finished_at, community_id')
      .eq('id', projectId)
      .single();

    if (challengeError || !challenge) return { error: "Projet introuvable." };

    const { data: tasks } = await supabase
      .from('challenge_tasks')
      .select('title, description, status, points, completed_at')
      .eq('challenge_id', projectId);

    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('progress, total_points, status, profiles(username)')
      .eq('challenge_id', projectId);

    const { data: community } = await supabase
      .from('communities')
      .select('name')
      .eq('id', challenge.community_id)
      .single();

    const doneTasks = tasks?.filter(t => t.status === 'done') || [];
    const pendingTasks = tasks?.filter(t => t.status !== 'done') || [];
    const totalTasks = tasks?.length || 0;

    let prompt = `Génère une carte d'héritage complète pour ce projet qui est en cours d'abandon :\n\n`;
    prompt += `Titre : ${challenge.title}\n`;
    if (challenge.description) prompt += `Description : ${challenge.description.substring(0, 500)}\n`;
    prompt += `Statut actuel : ${challenge.status}\n`;
    prompt += `Communauté : ${community?.name || "Communauté"}\n`;
    prompt += `Créé le : ${new Date(challenge.created_at).toLocaleDateString()}\n`;
    if (challenge.finished_at) prompt += `Terminé le : ${new Date(challenge.finished_at).toLocaleDateString()}\n`;
    if (reason) prompt += `Raison de l'abandon : ${reason}\n`;

    prompt += `\nTâches terminées (${doneTasks.length}) :\n`;
    doneTasks.forEach(t => {
      prompt += `  ✅ "${t.title}" (${t.points}pts)${t.completed_at ? ` — ${new Date(t.completed_at).toLocaleDateString()}` : ''}\n`;
    });

    prompt += `\nTâches restantes (${pendingTasks.length}) :\n`;
    pendingTasks.forEach(t => {
      prompt += `  ⏳ "${t.title}" (${t.points}pts)${t.description ? `: ${t.description.substring(0, 100)}` : ''}\n`;
    });

    prompt += `\nParticipants (${participants?.length || 0}) :\n`;
    participants?.forEach((p: any) => {
      prompt += `  - ${p.profiles?.username || "Anonyme"}: ${p.progress}% progression, ${p.total_points} points\n`;
    });

    const progress = totalTasks > 0 ? Math.round(doneTasks.length / totalTasks * 100) : 0;
    prompt += `\nProgression globale : ${progress}%\n`;
    prompt += `Total tâches : ${tasks?.length || 0}\n`;

    prompt += `\nGénère une carte d'héritage avec :\n`;
    prompt += `1. "summary" : résumé de ce qui a été accompli, en 3-4 phrases\n`;
    prompt += `2. "whatWorked" : liste des éléments qui ont bien fonctionné\n`;
    prompt += `3. "whatDidntWork" : liste des obstacles ou difficultés rencontrées\n`;
    prompt += `4. "remainingTasks" : tâches qui restent à faire, clairement listées\n`;
    prompt += `5. "handoffNotes" : instructions détaillées pour la personne qui reprendra le projet\n`;
    prompt += `6. "techState" : état technique actuel (ce qui compile, ce qui marche, ce qui est cassé)\n`;

    const client = createGroqClient();
    const model = getGroqModel();

    const chatResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: PROJECT_AI_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = chatResponse.choices?.[0]?.message?.content;
    if (!raw) return { error: "L'IA n'a pas pu générer la carte d'héritage." };

    const parsed = parseAIJson<HeritageProjectResult>(raw);
    const heritageData: HeritageProjectResult = parsed ?? {
      summary: `Le projet "${challenge.title}" a atteint ${progress}% de progression avec ${doneTasks.length}/${totalTasks || 0} tâches terminées.`,
      whatWorked: doneTasks.map(t => t.title),
      whatDidntWork: ["Progression interrompue"],
      remainingTasks: pendingTasks.map(t => t.title),
      handoffNotes: "Reprendre les tâches restantes dans l'ordre de priorité. Consulter la description du projet pour le contexte initial.",
      techState: `Statut : ${challenge.status}. ${doneTasks.length} tâches complétées, ${pendingTasks.length} en attente.`,
    };

    const heritagePayload = JSON.stringify(heritageData);
    const newDescription = buildDescriptionWithAI(
      challenge.description,
      `__AI_HERITAGE__${heritagePayload}__AI_HERITAGE__`
    );

    await supabase
      .from('challenges')
      .update({ description: newDescription })
      .eq('id', projectId);

    return { data: heritageData };
  } catch (error) {
    console.error('Erreur generateHeritageProject:', error);
    return { error: "Erreur lors de la génération de la carte d'héritage." };
  }
}
