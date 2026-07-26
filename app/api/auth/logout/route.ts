import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/lib/services/auth';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const result = await logout(supabase);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}