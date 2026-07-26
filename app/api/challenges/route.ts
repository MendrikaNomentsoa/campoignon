import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listChallenges, createChallenge } from '@/lib/services/challenges';

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

  return NextResponse.json({ challenges: result.data });
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
  const { community_id, title, description, reward } = body;

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
    reward,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ challenge: result.data }, { status: 201 });
}