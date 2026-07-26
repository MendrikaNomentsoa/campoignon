import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listUpcomingChallenges } from '@/lib/services/challenges';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const result = await listUpcomingChallenges(supabase, { userId: user.id });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ challenges: result.data });
}
