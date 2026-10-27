type IconProps = {
  className?: string;
  /** Filled heart (saved state) vs outline (unsaved). */
  filled?: boolean;
};

export function HeartIcon({ className, filled = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 20.5s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.4a4.5 4.5 0 0 1 7.5 3.1c0 5.4-7.5 10-7.5 10Z" />
    </svg>
  );
}
