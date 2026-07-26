import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMessages, sendMessage } from '@/lib/services/discussion';

// GET - Récupérer les messages d'une communauté
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const communityId = searchParams.get('communityId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    if (!communityId) {
      return NextResponse.json(
        { error: 'communityId est requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de la communauté
    const { data: membership, error: membershipError } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des droits' },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas membre de cette communauté' },
        { status: 403 }
      );
    }

    const result = await getMessages(supabase, { communityId, limit, before });
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { communityId, content, parentId } = body;

    if (!communityId || !content) {
      return NextResponse.json(
        { error: 'communityId et content sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de la communauté
    const { data: membership, error: membershipError } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des droits' },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas membre de cette communauté' },
        { status: 403 }
      );
    }

    const result = await sendMessage(supabase, {
      communityId,
      userId: user.id,
      content,
      parentId,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}