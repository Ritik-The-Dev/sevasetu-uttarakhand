export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" className="fill-primary" />
      <path d="M6 28 L15 16 L20 22 L26 13 L34 28 Z" className="fill-secondary" />
      <path d="M26 13 L29 17.5 L23.5 18 Z" className="fill-primary-foreground" opacity=".9" />
      <path d="M8 31 Q20 24 32 31" className="stroke-saffron" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
