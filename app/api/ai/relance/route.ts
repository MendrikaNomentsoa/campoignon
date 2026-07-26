import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRelanceBriefing } from '@/lib/ai/relance';

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

    const result = await generateRelanceBriefing(supabase, {
      challengeId,
      communityId,
      userId: user.id,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Erreur API relance:', error);
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

    const challengeId = request.nextUrl.searchParams.get('challengeId');
    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId est requis' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('restart_briefings')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(5);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Erreur API relance GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
