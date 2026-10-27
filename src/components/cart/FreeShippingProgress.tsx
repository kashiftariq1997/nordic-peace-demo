import { FREE_SHIPPING_THRESHOLD } from "@/constants";
import type { Money } from "@/types";
import { formatMoney } from "@/utils";

type FreeShippingProgressProps = {
  subtotal: Money;
};

/** Free-shipping progress bar (threshold from FREE_SHIPPING_THRESHOLD). */
export function FreeShippingProgress({ subtotal }: FreeShippingProgressProps) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.amount);
  const progress = Math.min(100, Math.round((subtotal.amount / FREE_SHIPPING_THRESHOLD) * 100));
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
