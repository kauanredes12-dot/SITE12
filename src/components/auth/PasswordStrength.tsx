import { getPasswordStrength } from '@/lib/validation';

const BAR_CLASS: Record<1 | 2 | 3, string> = {
  1: 'bg-error-500',
  2: 'bg-brand-500',
  3: 'bg-brand-700',
};

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { level, label } = getPasswordStrength(password);

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              segment <= level ? BAR_CLASS[level] : 'bg-ink-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink-900">Força: {label}</span>
    </div>
  );
}
