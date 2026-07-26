import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createChallenge, listChallenges } from '@/lib/services/challenges';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId');

  if (!communityId) {
    return NextResponse.json({ error: 'communityId requis' }, { status: 400 });
  }

  const supabase = await createClient();
  const result = await listChallenges(supabase, { communityId });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const projects = (result.data ?? []).map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    resources: c.resources ?? null,
    created_at: c.created_at,
    updated_at: c.updated_at ?? c.created_at,
    created_by: c.creator_id,
    community_id: c.community_id,
    challenge_id: c.id,
  }));

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, community_id } = body;

  if (!community_id || !title) {
    return NextResponse.json(
      { error: 'community_id et title sont requis' },
      { status: 400 }
    );
  }

  const result = await createChallenge(supabase, {
    communityId: community_id,
    creatorId: user.id,
    title,
    description,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const project = {
    id: result.data.id,
    title: result.data.title,
    description: result.data.description,
    resources: result.data.resources ?? null,
    created_at: result.data.created_at,
    updated_at: result.data.updated_at ?? result.data.created_at,
    created_by: result.data.creator_id,
    community_id: result.data.community_id,
    challenge_id: result.data.id,
  };

  return NextResponse.json({ project }, { status: 201 });
}
