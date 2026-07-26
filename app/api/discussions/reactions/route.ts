import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addReaction, removeReaction } from '@/lib/services/discussion';

// POST - Ajouter une réaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, reaction } = body;

    if (!messageId || !reaction) {
      return NextResponse.json(
        { error: 'messageId et reaction sont requis' },
        { status: 400 }
      );
    }

    const { data: message, error: messageError } = await supabase
      .from('discussion_messages')
      .select('community_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message introuvable' },
        { status: 404 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', message.community_id)
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

    const result = await addReaction(supabase, {
      messageId,
      userId: user.id,
      reaction,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la réaction' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une réaction
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');
    const reaction = searchParams.get('reaction');

    if (!messageId || !reaction) {
      return NextResponse.json(
        { error: 'messageId et reaction sont requis' },
        { status: 400 }
      );
    }

    const result = await removeReaction(supabase, {
      messageId,
      userId: user.id,
      reaction,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la réaction' },
      { status: 500 }
    );
  }
}
