import { supabase } from '@/lib/supabase';
import type { Profile, ProfileRole } from '@/types/auth';

const GENERIC_ERROR = 'Não foi possível concluir a operação. Tente novamente.';
const DUPLICATE_EMAIL = 'Este e-mail já possui uma conta. Entre ou recupere sua senha.';

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: ProfileRole;
  created_at: string;
};

function mapAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (text.includes('already registered') || text.includes('already been registered')) return DUPLICATE_EMAIL;
  if (text.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (text.includes('rate limit') || text.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  if (text.includes('should be at least') || text.includes('weak')) {
    return 'A senha é fraca. Use pelo menos 8 caracteres, com letras e números.';
  }
  if (text.includes('different from the old')) return 'A nova senha precisa ser diferente da atual.';
  return GENERIC_ERROR;
}

function toAuthError(error: { message: string }): Error {
  console.error('auth request failed', error.message);
  return new Error(mapAuthError(error.message));
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function signUpWithEmail(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ hasSession: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });
  if (error) throw toAuthError(error);
  if (data.user?.identities?.length === 0) throw new Error(DUPLICATE_EMAIL);
  return { hasSession: data.session !== null };
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toAuthError(error);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  if (error) throw toAuthError(error);
}

export async function updateAccountPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAuthError(error);
}

export async function verifyCurrentPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Senha atual incorreta.');
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthError(error);
}

export async function fetchOwnProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('profile load failed', error.message);
    throw new Error(GENERIC_ERROR);
  }
  if (!data) throw new Error(GENERIC_ERROR);
  return mapProfile(data);
}

export async function updateOwnFullName(userId: string, fullName: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
  if (error) {
    console.error('profile update failed', error.message);
    throw new Error(GENERIC_ERROR);
  }
}
