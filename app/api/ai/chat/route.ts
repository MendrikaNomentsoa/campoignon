// app/api/ai/chat/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateChatResponse } from '@/lib/ai/chat';
import { z } from 'zod';

// Schéma de validation pour la requête
const chatSchema = z.object({
  communityId: z.string().uuid(),
  challengeId: z.string().uuid().optional().nullable(),
  message: z.string().min(1, 'Le message est requis'),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Valider le corps de la requête
    const body = await request.json();
    const validationResult = chatSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { communityId, challengeId, message } = validationResult.data;

    // Générer la réponse de l'IA
    const result = await generateChatResponse(supabase, {
      userId: user.id,
      communityId,
      challengeId: challengeId || null,
      message,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ response: result.data });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}