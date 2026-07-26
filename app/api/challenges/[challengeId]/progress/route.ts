import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateProgress } from '@/lib/services/challenges';

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

  const body = await request.json();
  const { progress } = body;

  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    return NextResponse.json(
      { error: 'progress doit être un nombre entre 0 et 100' },
      { status: 400 }
    );
  }

  const result = await updateProgress(supabase, {
    challengeId,
    userId: user.id,
    progress,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ participant: result.data });
}