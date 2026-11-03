import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-ink-900 shadow-sm hover:bg-brand-600 active:bg-brand-700 active:text-white disabled:bg-ink-200 disabled:text-ink-500',
  secondary:
    'bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:ring-brand-500 hover:text-brand-800 disabled:text-ink-500',
  ghost: 'text-ink-900 hover:bg-brand-50 hover:text-brand-800',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleOptions = {}): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
    'transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0',
    'disabled:pointer-events-none disabled:translate-y-0',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
  ].join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & { children: ReactNode };

export function Button({ variant, size, fullWidth, className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonStyles({ variant, size, fullWidth })} ${className}`}
      {...props}
    />
  );
}
