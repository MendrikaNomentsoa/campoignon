import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLeaderboard } from '@/lib/services/challenges';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  const supabase = await createClient();

  const result = await getLeaderboard(supabase, { challengeId });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ leaderboard: result.data });
}