import type { Money } from "@/types";
import { cn, formatMoney } from "@/utils";

export type PriceProps = {
  price: Money;
  compareAt?: Money | null;
  className?: string;
};

/** Current price with an optional struck-through compare-at price. */
export function Price({ price, compareAt, className }: PriceProps) {
  const onSale = Boolean(compareAt && compareAt.amount > price.amount);

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="text-plum">{formatMoney(price)}</span>
      {onSale && compareAt ? (
        <s className="text-plum-soft text-sm">{formatMoney(compareAt)}</s>
      ) : null}
    </span>
  );
}
