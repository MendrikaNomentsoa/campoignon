import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateProjectStatus, type ProjectStatus } from '@/lib/services/projects';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const projectStatus = body.project_status as ProjectStatus;

  if (!projectStatus) {
    return NextResponse.json({ error: 'project_status requis' }, { status: 400 });
  }

  const result = await updateProjectStatus(supabase, {
    projectId,
    userId: user.id,
    projectStatus,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
