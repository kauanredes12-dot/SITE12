export function NavCountBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-ink-900">
      {count}
    </span>
  );
}
