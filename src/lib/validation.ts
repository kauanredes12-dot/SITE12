const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_HINT = 'Use pelo menos 8 caracteres, com letras e números.';

export type PasswordErrors = { password?: string; confirmation?: string };

export type SignupValues = {
  fullName: string;
  email: string;
  password: string;
  confirmation: string;
};

export type SignupErrors = PasswordErrors & { fullName?: string; email?: string };

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function validateNewPassword(password: string, confirmation: string): PasswordErrors {
  const errors: PasswordErrors = {};
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = PASSWORD_HINT;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = 'A senha pode ter no máximo 72 caracteres.';
  }
  if (confirmation !== password) errors.confirmation = 'As senhas não coincidem.';
  return errors;
}

export function validateSignup(values: SignupValues): SignupErrors {
  const errors: SignupErrors = validateNewPassword(values.password, values.confirmation);
  const name = values.fullName.trim();
  if (name.length < 2 || name.length > 120) {
    errors.fullName = 'Informe seu nome completo (de 2 a 120 letras).';
  }
  if (!isValidEmail(values.email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }
  return errors;
}

export function getPasswordStrength(password: string): { level: 1 | 2 | 3; label: string } {
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (score >= 4) return { level: 3, label: 'Forte' };
  if (score >= 2) return { level: 2, label: 'Média' };
  return { level: 1, label: 'Fraca' };
}
