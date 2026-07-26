import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listSignals, createSignal } from '@/lib/services/signals';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId');

  if (!communityId) {
    return NextResponse.json({ error: 'communityId requis' }, { status: 400 });
  }

  const supabase = await createClient();
  const result = await listSignals(supabase, { communityId });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ signals: result.data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { community_id, challenge_id, task_id, type, message } = body;

  if (!community_id || !type) {
    return NextResponse.json(
      { error: 'community_id et type sont requis' },
      { status: 400 }
    );
  }

  const result = await createSignal(supabase, {
    userId: user.id,
    communityId: community_id,
    challengeId: challenge_id,
    taskId: task_id,
    type,
    message,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ signal: result.data }, { status: 201 });
}