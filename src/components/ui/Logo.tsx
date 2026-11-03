export function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src="/9770fe30-c315-4e01-a799-9403865eac5b.png"
      alt="EDVORA"
      width={48}
      height={48}
      className={`h-12 w-12 object-contain ${className}`}
    />
  );
}
