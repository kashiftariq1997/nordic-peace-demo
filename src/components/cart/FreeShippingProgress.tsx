import type { Money } from "@/types";
import { formatMoney } from "@/utils";

type FreeShippingProgressProps = {
  subtotal: Money;
  /** FREE_SHIPPING_THRESHOLD amount in the cart's currency (server-read env). */
  threshold: number;
};

/** Free-shipping progress bar — amount and currency both come from the cart. */
export function FreeShippingProgress({ subtotal, threshold }: FreeShippingProgressProps) {
  const remaining = Math.max(0, threshold - subtotal.amount);
  const progress = Math.min(100, Math.round((subtotal.amount / threshold) * 100));
  const unlocked = remaining === 0;

  return (
    <div className="border-line flex flex-col gap-2.5 border-b px-5 py-4">
      <p role="status" className="text-plum-soft text-xs leading-5">
        {unlocked ? (
          <span className="text-rose-ink font-medium">Complimentary shipping unlocked ✓</span>
        ) : (
          <>
            You&apos;re{" "}
            <span className="text-plum font-medium">
              {formatMoney({ amount: remaining, currencyCode: subtotal.currencyCode })}
            </span>{" "}
            away from complimentary shipping
          </>
        )}
      </p>
      <div className="bg-blush-deep h-2 overflow-hidden rounded-full" aria-hidden="true">
        <div
          className="bg-rose-ink h-full rounded-full transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
