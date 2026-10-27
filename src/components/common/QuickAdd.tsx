"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart";
import { Button, buttonClassName } from "@/components/ui";
import { ChevronIcon, CloseIcon } from "@/icons";
import type { Product } from "@/types";
import { cn, defaultSelection, formatMoney, isValueAvailable, matchVariant } from "@/utils";

type Phase = "idle" | "added";

export type QuickAddProps = {
  product: Product;
};

/**
 * Quick-add on every product card (mini step after spec Step C). A
 * single-variant product adds directly via the cart provider (drawer opens);
 * multi-variant products expand an inline size/color picker first. The
 * trigger stays mounted so Escape can return focus to it; every target is
 * >= 44px and unavailable values are disabled.
 */
export function QuickAdd({ product }: QuickAddProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>(() => defaultSelection(product));
  const [phase, setPhase] = useState<Phase>("idle");
  const { addLine } = useCart();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const multi = product.variants.length > 1;
  const variant = matchVariant(product, selected);
  const soldOut = !product.availableForSale;
  const canAdd = !soldOut && variant?.availableForSale === true;

  // Close on outside press or Escape (listener callbacks — lint-safe).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move focus into the panel when it opens — first enabled option chip.
  useEffect(() => {
    if (!open) return;
    const target =
      panelRef.current?.querySelector<HTMLButtonElement>("fieldset button:not(:disabled)") ??
      panelRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    target?.focus();
  }, [open]);

  const handleAdd = async () => {
    if (!canAdd || !variant) return;
    const added = await addLine({
      merchandiseId: variant.id,
      quantity: 1,
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
      setOpen(false);
      setPhase("added");
      window.setTimeout(() => setPhase("idle"), 2500);
    }
  };

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={buttonClassName({ variant: "secondary", size: "sm", className: "w-full" })}
      >
        Sold out
      </button>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={multi ? open : undefined}
        aria-controls={multi ? `${product.handle}-quick-add` : undefined}
        onClick={() => {
          if (multi) {
            setOpen((current) => !current);
          } else {
            void handleAdd();
          }
        }}
        className={buttonClassName({
          variant: "secondary",
          size: "sm",
          className: cn("w-full", phase === "added" && "border-rose-ink text-rose-ink"),
        })}
      >
        {phase === "added" ? (
          "Added ✓"
        ) : multi ? (
          <>
            Quick add
            <ChevronIcon className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </>
        ) : (
          "Quick add"
        )}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={`${product.handle}-quick-add`}
          role="group"
          aria-label={`Quick add — ${product.title}`}
          className="border-line bg-cream shadow-soft flex flex-col gap-3 rounded-3xl border p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-plum-soft text-xs font-medium tracking-[0.2em] uppercase">
              Choose options
            </p>
            <button
              type="button"
              aria-label="Close quick add"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="text-plum-soft hover:text-rose-ink -mr-1 flex h-11 w-11 shrink-0 items-center justify-center transition-colors"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {product.options.map((option) => (
            <fieldset key={option.name}>
              <legend className="text-plum-soft mb-2 text-xs font-medium tracking-[0.2em] uppercase">
                {option.name}
              </legend>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const available = isValueAvailable(product, selected, option.name, value);
                  const isSelected = selected[option.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelected((current) => ({ ...current, [option.name]: value }))
                      }
                      className={`min-h-11 min-w-11 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
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

          <Button size="sm" className="w-full" disabled={!canAdd} onClick={() => void handleAdd()}>
            {canAdd
              ? `Add to bag — ${formatMoney(variant?.price ?? product.priceRange.min)}`
              : "Sold out"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
