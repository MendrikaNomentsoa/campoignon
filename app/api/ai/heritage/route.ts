import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHeritageCard, getHeritageCards } from '@/lib/ai/heritage';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, communityId } = body;

    if (!challengeId || !communityId) {
      return NextResponse.json({ error: 'challengeId et communityId sont requis' }, { status: 400 });
    }

    const result = await generateHeritageCard(supabase, { challengeId, communityId });
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Erreur API heritage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const communityId = request.nextUrl.searchParams.get('communityId');
    if (!communityId) {
      return NextResponse.json({ error: 'communityId est requis' }, { status: 400 });
    }

    const result = await getHeritageCards(supabase, { communityId });
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Erreur API heritage GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
