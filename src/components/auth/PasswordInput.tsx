import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FormField, INPUT_CLASS } from '@/components/ui/FormField';

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
  disabled?: boolean;
};

export function PasswordInput({ id, label, value, onChange, autoComplete, error, disabled }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField id={id} label={label} error={error}>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${INPUT_CLASS} pr-14`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
          disabled={disabled}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50"
        >
          {isVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </FormField>
  );
}
