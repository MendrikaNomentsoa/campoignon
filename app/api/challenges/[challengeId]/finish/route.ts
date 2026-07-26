import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { closeChallenge } from '@/lib/services/challenges';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const result = await closeChallenge(supabase, { challengeId, userId: user.id });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}