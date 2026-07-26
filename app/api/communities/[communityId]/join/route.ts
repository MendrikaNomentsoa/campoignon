import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { joinCommunity } from '@/lib/services/communities';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const result = await joinCommunity(supabase, { communityId, userId: user.id });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.alreadyMember) {
    return NextResponse.json(
      { message: 'Déjà membre de cette communauté' },
      { status: 200 }
    );
  }

  return NextResponse.json({ membership: result.data }, { status: 201 });
}