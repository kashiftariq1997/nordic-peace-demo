"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input, buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import { CloseIcon } from "@/icons";
import { cn, formatMoney, useFocusTrap } from "@/utils";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartContext";
import { FreeShippingProgress } from "./FreeShippingProgress";

/**
 * Slide-in cart drawer (spec Step B) — opens from the right (auto-opens after
 * add-to-cart), Esc/backdrop/close all dismiss it, body scroll locks while
 * open. Lines mutate optimistically through the cart provider; discount and
 * checkout live in the footer.
 */
export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { cart, isOpen, closeCart, applyDiscount } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  // Focus the drawer on open, lock scroll, return focus to the opener on close.
  useEffect(() => {
    if (!isOpen) return;
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      if (opener?.isConnected) opener.focus();
    };
  }, [isOpen]);

  // Tab is confined to the dialog; Escape closes (focus restore runs above).
  useFocusTrap(panelRef, isOpen, closeCart);

  const handleApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplying(true);
    const accepted = await applyDiscount(code.trim());
    setApplying(false);
    if (accepted) setCode("");
  };

  const itemCount = cart.totalQuantity;

  return (
    <div
      className={cn("fixed inset-0 z-50", isOpen ? "" : "pointer-events-none")}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close bag"
        onClick={closeCart}
        className={cn(
          "bg-plum/40 absolute inset-0 cursor-default transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={cn(
          "bg-cream shadow-soft absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-baseline gap-3">
            <h2 className="font-heading text-plum text-2xl">Your bag</h2>
            <p className="text-plum-soft text-xs">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="text-plum hover:text-rose-ink flex h-11 w-11 items-center justify-center"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Hidden while empty: an empty bag has no Shopify money to format
            (the local zero would claim the wrong currency). */}
        {cart.lines.length > 0 ? (
          <FreeShippingProgress subtotal={cart.subtotal} threshold={freeShippingThreshold} />
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-heading text-plum text-xl">Your bag is empty</p>
              <p className="text-plum-soft max-w-[16rem] text-sm">
                Something soft is waiting — pajamas, bedding and little gifts.
              </p>
              <Link
                href={ROUTES.COLLECTION_ALL}
                onClick={closeCart}
                className={buttonClassName({ size: "sm" })}
              >
                Shop the collection
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>
          )}
        </div>

        <div className="border-line flex shrink-0 flex-col gap-4 border-t px-5 py-4">
          <form onSubmit={handleApply} className="flex gap-2">
            <label htmlFor="cart-discount-code" className="sr-only">
              Discount code
            </label>
            <Input
              id="cart-discount-code"
              name="discount-code"
              placeholder="Discount code"
              value={code}
              autoComplete="off"
              className="flex-1"
              onChange={(event) => setCode(event.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm" disabled={applying}>
              {applying ? "…" : "Apply"}
            </Button>
          </form>

          {cart.discount ? (
            <div className="text-plum-soft flex items-center justify-between gap-3 text-xs">
              <p className="text-plum font-medium">
                {cart.discount.code} applied
                {cart.discount.amount
                  ? ` — −${formatMoney(cart.discount.amount)}`
                  : " — final total at checkout"}
              </p>
              <button
                type="button"
                onClick={() => void applyDiscount("")}
                className="flex min-h-11 items-center underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          ) : null}

          {cart.lines.length > 0 ? (
            <div className="flex flex-col gap-2 text-sm">
              <div className="text-plum-soft flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-plum">{formatMoney(cart.subtotal)}</span>
              </div>
              <div className="text-plum flex items-center justify-between text-base font-medium">
                <span>Total</span>
                <span>{formatMoney(cart.total)}</span>
              </div>
            </div>
          ) : null}

          {cart.checkoutUrl ? (
            <a
              href={cart.checkoutUrl}
              className={buttonClassName({ className: "w-full" })}
              rel="noopener noreferrer"
            >
              Checkout
            </a>
          ) : (
            <>
              <Button type="button" disabled className="w-full">
                Checkout
              </Button>
              <p className="text-plum-soft text-center text-xs">
                Demo catalog — connect Shopify to enable checkout.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
