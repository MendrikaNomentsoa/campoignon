import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function toProject(data: any) {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    resources: null,
    parsed_resources: [],
    created_at: data.created_at,
    created_by: data.creator_id,
    community_id: data.community_id,
    challenge_id: data.id,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
  }

  return NextResponse.json({ project: toProject(data) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;

  if (Object.keys(updateData).length === 0) {
    const { data } = await supabase.from('challenges').select('*').eq('id', projectId).single();
    return NextResponse.json({ project: data ? toProject(data) : null });
  }

  const { data, error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ project: toProject(data) });
}
