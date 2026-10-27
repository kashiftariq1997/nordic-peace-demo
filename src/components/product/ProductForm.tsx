"use client";

import { useState, type FormEvent } from "react";
import { Price } from "@/components/common";
import { useCart } from "@/components/cart";
import { Badge, Button } from "@/components/ui";
import { FREE_SHIPPING_THRESHOLD } from "@/constants";
import type { Product } from "@/types";
import { defaultSelection, formatMoney, isValueAvailable, matchVariant } from "@/utils";

type ProductFormProps = {
  product: Product;
};

type FormPhase = "idle" | "added";

/**
 * Product purchase form (spec Steps A+B) — variant selectors with
 * unavailable states, quantity stepper, price that follows the selected
 * variant, Add to Cart (goes through the cart provider: optimistic line,
 * drawer opens, Added to Cart fires when the server confirms), and a fixed
 * mobile sticky bar.
 */
export function ProductForm({ product }: ProductFormProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() => defaultSelection(product));
  const [quantity, setQuantity] = useState(1);
  const [phase, setPhase] = useState<FormPhase>("idle");
  const { addLine } = useCart();

  const variant = matchVariant(product, selected);
  const soldOut = !product.availableForSale || !variant?.availableForSale;

  const maxQuantity = soldOut ? 1 : Math.min(99, Math.max(1, variant?.quantityAvailable ?? 99));
  const clampedQuantity = Math.min(quantity, maxQuantity);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (soldOut || !variant) return;

    const added = await addLine({
      merchandiseId: variant.id,
      quantity: clampedQuantity,
      preview: {
        productId: product.id,
        handle: product.handle,
        productTitle: product.title,
        variantTitle: variant.title,
        imageUrl: product.featuredImage?.url ?? null,
        imageAlt: product.featuredImage?.altText ?? product.title,
        unitPrice: variant.price,
        compareAtPrice: variant.compareAtPrice,
        maxQuantity:
          variant.quantityAvailable && variant.quantityAvailable > 0
            ? variant.quantityAvailable
            : null,
      },
    });
    if (added) {
      setPhase("added");
      window.setTimeout(() => setPhase("idle"), 2500);
    }
  };

  const price = variant?.price ?? product.priceRange.min;
  const compareAt = variant?.compareAtPrice ?? null;

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        {product.badges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge} badge={badge} />
            ))}
          </div>
        ) : null}

        <p className="text-rose-ink text-xs font-medium tracking-[0.25em] uppercase">
          {product.productType}
        </p>
        <h1 className="font-heading text-plum text-3xl leading-tight tracking-tight sm:text-4xl">
          {product.title}
        </h1>
        <Price price={price} compareAt={compareAt} className="font-heading text-2xl" />
      </div>

      {product.options.map((option) => (
        <fieldset key={option.name} className="flex flex-col gap-3">
          <legend className="text-plum mb-3 text-xs font-medium tracking-[0.2em] uppercase">
            {option.name}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {option.values.map((value) => {
              const available = isValueAvailable(product, selected, option.name, value);
              const isSelected = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}
                  className={`min-h-11 rounded-full border px-5 text-sm font-medium transition-colors duration-200 ${
                    isSelected
                      ? "border-plum bg-plum text-cream"
                      : available
                        ? "border-line text-plum hover:border-rose-ink hover:text-rose-ink bg-transparent"
                        : "text-plum-soft/50 border-line bg-transparent line-through disabled:cursor-not-allowed"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-col gap-3">
        <span className="text-plum text-xs font-medium tracking-[0.2em] uppercase">Quantity</span>
        <div className="border-line bg-cream flex w-fit items-center rounded-full border">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={clampedQuantity <= 1}
            onClick={() => setQuantity(clampedQuantity - 1)}
            className="text-plum hover:text-rose-ink h-11 w-11 rounded-full text-lg disabled:opacity-40"
          >
            −
          </button>
          <span aria-live="polite" className="text-plum w-10 text-center text-sm font-medium">
            {clampedQuantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={clampedQuantity >= maxQuantity}
            onClick={() => setQuantity(clampedQuantity + 1)}
            className="text-plum hover:text-rose-ink h-11 w-11 rounded-full text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={soldOut}
        className="w-full"
        aria-describedby="add-to-cart-status"
      >
        {soldOut
          ? "Sold out"
          : phase === "added"
            ? "Added to bag ✓"
            : `Add to bag — ${formatMoney({ amount: price.amount * clampedQuantity, currencyCode: price.currencyCode })}`}
      </Button>

      <p id="add-to-cart-status" role="status" className="sr-only">
        {phase === "added" ? `${product.title} added to your bag` : ""}
      </p>

      <p className="text-plum-soft text-xs leading-5">
        Complimentary shipping on orders over ${FREE_SHIPPING_THRESHOLD}.{" "}
        {product.metafields.deliveryNote ?? ""}
      </p>

      {/* Sticky mobile add-to-cart bar — shares the form's state via submit.
          Lifts above the cookie banner via --cookie-banner-h (see
          CookieConsentBanner) so consent never covers the purchase action. */}
      <div className="border-line bg-cream/95 fixed inset-x-0 bottom-[var(--cookie-banner-h,0px)] z-30 flex items-center gap-4 border-t px-4 py-3 backdrop-blur sm:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-plum truncate text-sm font-medium">{product.title}</p>
          <Price price={price} compareAt={compareAt} className="text-sm" />
        </div>
        <Button type="submit" disabled={soldOut} className="shrink-0" size="sm">
          {soldOut ? "Sold out" : phase === "added" ? "Added ✓" : "Add to bag"}
        </Button>
      </div>
    </form>
  );
}
