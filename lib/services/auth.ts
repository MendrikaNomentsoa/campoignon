import { SupabaseClient } from '@supabase/supabase-js';
import { SignupInput, LoginInput } from '@/lib/validators/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// Inscription
export async function signup(
  supabase: SupabaseClient,
  { email, password, username }: SignupInput
) {
  // 1. Créer l'utilisateur dans auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (authError) {
    return { error: authError.message, status: 400 } as const;
  }

  if (!authData.user) {
    return { error: "Erreur lors de la création de l'utilisateur", status: 500 } as const;
  }

  // 2. Créer le profil dans la table profiles (via le client admin pour bypass RLS)
  const admin = createAdminClient();
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: authData.user.id,
      username,
    });

  if (profileError) {
    return { error: profileError.message, status: 500 } as const;
  }

  return {
    data: {
      user: authData.user,
      session: authData.session,
    },
  } as const;
}

// Connexion
export async function login(
  supabase: SupabaseClient,
  { email, password }: LoginInput
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, status: 401 } as const;
  }

  if (!data.user) {
    return { error: "Erreur lors de la connexion", status: 500 } as const;
  }

  return {
    data: {
      user: data.user,
      session: data.session,
    },
  } as const;
}

// Déconnexion
export async function logout(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message, status: 500 } as const;
  }

  return { data: { success: true } } as const;
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Non authentifié', status: 401 } as const;
  }

  // Récupérer aussi le profil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, created_at')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { error: profileError.message, status: 500 } as const;
  }

  return {
    data: {
      user,
      profile,
    },
  } as const;
}