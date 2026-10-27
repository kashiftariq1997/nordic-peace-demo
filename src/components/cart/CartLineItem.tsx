"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants";
import type { CartLine } from "@/types";
import { formatMoney } from "@/utils";
import { useCart } from "./CartContext";

type CartLineItemProps = {
  line: CartLine;
};

/** One cart row — image, link, quantity stepper, remove, line total. */
export function CartLineItem({ line }: CartLineItemProps) {
  const { updateLine, removeLine, closeCart } = useCart();
  const max = line.maxQuantity ?? 99;
  const lineTotal = {
    amount: line.unitPrice.amount * line.quantity,
    currencyCode: line.unitPrice.currencyCode,
  };

  return (
    <li className="flex gap-4">
      <Link
        href={ROUTES.product(line.handle)}
        onClick={closeCart}
        aria-label={line.productTitle}
        className="bg-blush relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl"
      >
        {line.imageUrl ? (
          <Image
            src={line.imageUrl}
            alt={line.imageAlt}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="font-heading text-rose-ink absolute inset-0 flex items-center justify-center text-sm">
            NP
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={ROUTES.product(line.handle)}
            onClick={closeCart}
            className="font-heading text-plum hover:text-rose-ink min-w-0 text-base leading-snug transition-colors"
          >
            {line.productTitle}
          </Link>
          <p className="text-plum shrink-0 text-sm font-medium">{formatMoney(lineTotal)}</p>
        </div>
        <p className="text-plum-soft text-xs">{line.variantTitle}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="border-line bg-cream flex items-center rounded-full border">
            <button
              type="button"
              aria-label={`Decrease quantity of ${line.productTitle}`}
              disabled={line.quantity <= 1}
              onClick={() => void updateLine(line.id, line.quantity - 1)}
              className="text-plum hover:text-rose-ink h-11 w-11 rounded-full text-sm disabled:opacity-40"
            >
              −
            </button>
            <span className="text-plum w-7 text-center text-xs font-medium">{line.quantity}</span>
            <button
              type="button"
              aria-label={`Increase quantity of ${line.productTitle}`}
              disabled={line.quantity >= max}
              onClick={() => void updateLine(line.id, line.quantity + 1)}
              className="text-plum hover:text-rose-ink h-11 w-11 rounded-full text-sm disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => void removeLine(line.id)}
            className="text-plum-soft hover:text-rose-ink flex min-h-11 items-center text-xs underline underline-offset-2 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
