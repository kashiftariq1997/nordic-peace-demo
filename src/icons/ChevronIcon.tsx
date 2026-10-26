export type ChevronIconProps = {
  className?: string;
};

/** Downward chevron — disclosure indicator (mobile filter panel). */
export function ChevronIcon({ className }: ChevronIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className} focusable="false">
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
