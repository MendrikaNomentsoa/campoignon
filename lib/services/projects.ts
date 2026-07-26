import { SupabaseClient } from '@supabase/supabase-js';
import { generateHeritageProject } from '@/lib/ai/project';

const PROJECT_STATUSES = ['active', 'paused', 'adoptable'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Change le statut d'abandon d'un projet (pause privée ou transmission à la
// communauté). Seul le créateur peut le faire. Passer en "adoptable" déclenche
// automatiquement la génération de la fiche résumé (héritage) par l'IA.
export async function updateProjectStatus(
  supabase: SupabaseClient,
  {
    projectId,
    userId,
    projectStatus,
  }: { projectId: string; userId: string; projectStatus: ProjectStatus }
) {
  if (!PROJECT_STATUSES.includes(projectStatus)) {
    return { error: 'Statut de projet invalide', status: 400 } as const;
  }

  const { data: project, error: projectError } = await supabase
    .from('challenges')
    .select('id, creator_id, project_status')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return { error: 'Projet introuvable', status: 404 } as const;
  }

  if (project.creator_id !== userId) {
    return {
      error: 'Seul le créateur du projet peut changer son statut',
      status: 403,
    } as const;
  }

  let heritage: unknown = null;

  if (projectStatus === 'adoptable') {
    const heritageResult = await generateHeritageProject(supabase, {
      projectId,
      reason: 'Transmis à la communauté',
    });
    if ('error' in heritageResult) {
      return { error: heritageResult.error, status: 500 } as const;
    }
    heritage = heritageResult.data;
  }

  const { data, error } = await supabase
    .from('challenges')
    .update({ project_status: projectStatus })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data: { project: data, heritage } } as const;
}
