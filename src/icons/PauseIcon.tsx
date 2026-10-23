type IconProps = {
  className?: string;
};

export function PauseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="7.5" y="6" width="3.2" height="12" rx="1.2" />
      <rect x="13.3" y="6" width="3.2" height="12" rx="1.2" />
    </svg>
  );
}
