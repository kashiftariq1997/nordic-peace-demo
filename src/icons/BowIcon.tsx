type IconProps = {
  className?: string;
};

/** Small ribbon bow motif used as a restrained decoration. */
export function BowIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11.3 12c-.85-2.5-2.6-4.3-4.85-4.3C4.15 7.7 2.7 9.55 2.7 12s1.45 4.3 3.75 4.3c2.25 0 4-1.8 4.85-4.3Z" />
      <path d="M12.7 12c.85-2.5 2.6-4.3 4.85-4.3 2.3 0 3.75 1.85 3.75 4.3s-1.45 4.3-3.75 4.3c-2.25 0-4-1.8-4.85-4.3Z" />
      <rect x="10.5" y="10.3" width="3" height="3.4" rx="1.3" />
    </svg>
  );
}
