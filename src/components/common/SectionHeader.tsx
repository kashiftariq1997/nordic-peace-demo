import Link from "next/link";
import { cn } from "@/utils";

export type SectionHeaderProps = {
  /** Small rose-ink label above the title. */
  eyebrow?: string;
  title: string;
  /** Optional "View all" style link on the right. */
  link?: { label: string; href: string };
  className?: string;
};

/** Section heading with optional eyebrow and right-hand link. */
export function SectionHeader({ eyebrow, title, link, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex flex-col gap-2">
        {eyebrow ? (
          <p className="text-rose-ink text-xs font-medium tracking-[0.25em] uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="font-heading text-plum text-3xl leading-tight tracking-tight sm:text-4xl">
          {title}
        </h2>
      </div>

      {link ? (
        <Link
          href={link.href}
          className="text-plum hover:text-rose-ink text-sm font-medium tracking-wide underline-offset-4 transition-colors hover:underline"
        >
          {link.label} →
        </Link>
      ) : null}
    </div>
  );
}
