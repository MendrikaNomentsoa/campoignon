import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHeritageCard } from '@/lib/ai/heritage';

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

  const { data: challenge } = await supabase
    .from('challenges')
    .select('community_id')
    .eq('id', projectId)
    .single();

  if (!challenge) {
    return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
  }

  const result = await generateHeritageCard(supabase, {
    challengeId: projectId,
    communityId: challenge.community_id,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
