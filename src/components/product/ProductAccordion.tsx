import type { ReactNode } from "react";
import { ChevronIcon } from "@/icons";

export type AccordionItem = {
  title: string;
  content: ReactNode;
};

type ProductAccordionProps = {
  items: readonly AccordionItem[];
};

/**
 * Product details accordion (spec Step A) — Details / Fabric & Care /
 * Shipping & Returns / Size Guide. Uses native <details> so it works without
 * JavaScript; the content wrapper styles table markup from the size_chart
 * metafield.
 */
export function ProductAccordion({ items }: ProductAccordionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border-line border-t">
      {items.map((item) => (
        <details key={item.title} className="border-line group border-b">
          <summary className="text-plum hover:text-rose-ink flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium [&::-webkit-details-marker]:hidden">
            {item.title}
            <ChevronIcon className="text-rose-ink h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          {/* overflow-x-auto keeps wide metafield tables (size chart) scrollable at 360px. */}
          <div className="text-plum-soft [&_a]:hover:text-rose-ink [&_td]:border-line [&_th]:border-line [&_th]:text-plum overflow-x-auto pb-5 text-sm leading-7 [&_a]:underline [&_a]:underline-offset-2 [&_p]:mb-3 [&_table]:w-full [&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_th]:border-t [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:tracking-wide [&_th]:uppercase">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
