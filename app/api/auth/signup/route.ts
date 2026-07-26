import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { signup } from '@/lib/services/auth';
import { signupSchema } from '@/lib/validators/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, username } = parsed.data;
    const supabase = await createClient();

    const result = await signup(supabase, { email, password, username });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        message: 'Inscription réussie',
        user: {
          id: result.data.user.id,
          email: result.data.user.email,
          username,
        },
        session: result.data.session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}