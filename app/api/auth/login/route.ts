import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { login } from '@/lib/services/auth';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();

    const result = await login(supabase, { email, password });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: result.data.user.id,
        email: result.data.user.email,
      },
      session: result.data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}