import type { ReactNode } from 'react';

export const INPUT_CLASS =
  'h-12 w-full rounded-xl bg-white px-4 text-base text-ink-900 ring-1 ring-inset ring-ink-200 placeholder:text-ink-500 transition focus:ring-2 focus:ring-brand-500 disabled:bg-ink-50 disabled:text-ink-500 aria-[invalid=true]:ring-error-500';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink-900">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-error-700">
          {error}
        </p>
      )}
    </div>
  );
}
