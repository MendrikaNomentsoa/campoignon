import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/services/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const result = await getCurrentUser(supabase);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      user: {
        id: result.data.user.id,
        email: result.data.user.email,
        username: result.data.profile.username,
        created_at: result.data.profile.created_at,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}