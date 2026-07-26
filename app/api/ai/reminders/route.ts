// app/api/ai/reminders/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUsersNeedingReminder } from '@/lib/ai/reminders';

export async function POST(request: Request) {
  try {
    // Vérifier la clé secrète pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();
    const result = await getUsersNeedingReminder(supabase);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: `Rappels générés avec succès. Nombre : ${result.data.generated}`,
      ...result.data,
    });
  } catch (error) {
    console.error('Error in /api/ai/reminders:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Pour lister les rappels d'un utilisateur
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('id, message, scheduled_at, sent, challenges(title)')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reminders: data });
  } catch (error) {
    console.error('Error in /api/ai/reminders GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}