type BrandWordmarkProps = {
  className?: string;
  versionClassName?: string;
};

export function BrandWordmark({
  className = '',
  versionClassName = 'text-accent-secondary violet-text-glow',
}: BrandWordmarkProps) {
  return (
    <span className={`font-brand font-extrabold uppercase tracking-[0.18em] ${className}`}>
      GENESIS <span className={versionClassName}>2.0</span>
    </span>
  );
}
