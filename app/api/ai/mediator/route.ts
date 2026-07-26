import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchError, generatePostMortem } from '@/lib/ai/mediator';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { action, communityId, challengeId, errorDescription } = body;

    if (action === 'match') {
      if (!communityId || !errorDescription) {
        return NextResponse.json({ error: 'communityId et errorDescription sont requis' }, { status: 400 });
      }
      const result = await matchError(supabase, {
        userId: user.id,
        communityId,
        errorDescription,
      });
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ data: result.data });
    }

    if (action === 'postmortem') {
      if (!challengeId || !communityId) {
        return NextResponse.json({ error: 'challengeId et communityId sont requis' }, { status: 400 });
      }
      const result = await generatePostMortem(supabase, {
        challengeId,
        communityId,
        generatedBy: user.id,
      });
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ data: result.data });
    }

    return NextResponse.json({ error: 'action invalide. Utilise "match" ou "postmortem"' }, { status: 400 });
  } catch (error) {
    console.error('Erreur API mediator:', error);
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

    // Récupérer les post-mortems de la communauté
    const { data, error } = await supabase
      .from('post_mortems')
      .select('*')
      .eq('community_id', communityId)
      .order('generated_at', { ascending: false })
      .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Erreur API mediator GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
