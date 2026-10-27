"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CART_ID_STORAGE_KEY, emptyCart } from "@/constants";
import {
  addCartLine,
  applyCartDiscount,
  fetchCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/cart-actions";
import type { CartLine, CartLineInput, CartState } from "@/types";
import { trackAddedToCart } from "@/utils";
import { CartContext, type CartValue } from "./CartContext";
import { CartDrawer } from "./CartDrawer";
import { CartToasts, type CartToast } from "./CartToasts";

const MAX_LINE_QUANTITY = 99;
const TOAST_DURATION_MS = 4500;

/** Recompute totals after a local (optimistic) line change. */
function withTotals(lines: CartLine[], base: CartState): CartState {
  const subtotalAmount = lines.reduce(
    (sum, line) => sum + line.unitPrice.amount * line.quantity,
    0,
  );
  const currencyCode = lines[0]?.unitPrice.currencyCode ?? base.subtotal.currencyCode;
  const subtotal = { amount: Math.round(subtotalAmount * 100) / 100, currencyCode };
  const total = base.discount?.amount
    ? {
        amount: Math.round((subtotal.amount - base.discount.amount.amount) * 100) / 100,
        currencyCode,
      }
    : subtotal;
  return {
    ...base,
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    total,
  };
}

function optimisticAdd(current: CartState, line: CartLineInput): CartState {
  const existing = current.lines.find(
    (candidate) => candidate.merchandiseId === line.merchandiseId,
  );
  if (existing) {
    return withTotals(
      current.lines.map((candidate) =>
        candidate.merchandiseId === line.merchandiseId
          ? {
              ...candidate,
              quantity: Math.min(MAX_LINE_QUANTITY, candidate.quantity + line.quantity),
            }
          : candidate,
      ),
      current,
    );
  }
  if (!line.preview) {
    return current; // Nothing to render yet — the server response fills it in.
  }
  const optimisticLine: CartLine = {
    id: `optimistic-${line.merchandiseId}`,
    quantity: line.quantity,
    merchandiseId: line.merchandiseId,
    ...line.preview,
  };
  return withTotals([...current.lines, optimisticLine], current);
}

function optimisticUpdate(current: CartState, lineId: string, quantity: number): CartState {
  return withTotals(
    current.lines.map((line) =>
      line.id === lineId
        ? {
            ...line,
            quantity: Math.max(1, Math.min(quantity, line.maxQuantity ?? MAX_LINE_QUANTITY)),
          }
        : line,
    ),
    current,
  );
}

function optimisticRemove(current: CartState, lineId: string): CartState {
  return withTotals(
    current.lines.filter((line) => line.id !== lineId),
    current,
  );
}

/**
 * Cart provider (spec Step B) — owns cart state, the drawer flag and error
 * toasts; exposes optimistic add/update/remove/discount actions backed by the
 * Server Actions in lib/cart-actions.ts. The cart id (Shopify mode) persists
 * in localStorage; mock mode keeps its lines in a server cookie. Every
 * successful add fires the consent-gated Added to Cart event.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCartState] = useState<CartState>(() => emptyCart());
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<CartToast[]>([]);
  const cartRef = useRef<CartState>(cart);
  const cartIdRef = useRef<string | null>(null);

  const setCart = useCallback((next: CartState) => {
    cartRef.current = next;
    setCartState(next);
  }, []);

  const pushToast = useCallback((message: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const ensureCartId = useCallback((): string => {
    if (cartIdRef.current) return cartIdRef.current;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(CART_ID_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (!stored) {
      stored =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;
      try {
        window.localStorage.setItem(CART_ID_STORAGE_KEY, stored);
      } catch {
        // Storage unavailable — the id lives for this session only.
      }
    }
    cartIdRef.current = stored;
    return stored;
  }, []);

  // Hydrate the persisted cart once on mount.
  useEffect(() => {
    let initialId: string | null = null;
    try {
      initialId = window.localStorage.getItem(CART_ID_STORAGE_KEY);
    } catch {
      initialId = null;
    }
    cartIdRef.current = initialId;
    let cancelled = false;
    fetchCart(initialId)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setCart(result.cart);
        } else {
          pushToast(result.error);
        }
      })
      .catch(() => {
        // Hydration is best-effort — the empty bag still works.
      });
    return () => {
      cancelled = true;
    };
  }, [setCart, pushToast]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback(
    async (line: CartLineInput): Promise<boolean> => {
      const previous = cartRef.current;
      const optimistic = optimisticAdd(previous, line);
      if (optimistic !== previous) setCart(optimistic);
      setIsOpen(true);

      const result = await addCartLine(ensureCartId(), line);
      if (result.ok) {
        setCart(result.cart);
        const added = result.cart.lines.find(
          (candidate) => candidate.merchandiseId === line.merchandiseId,
        );
        if (added) {
          trackAddedToCart({
            id: added.productId,
            name: added.productTitle,
            handle: added.handle,
            price: added.unitPrice.amount,
            quantity: line.quantity,
          });
        }
        return true;
      }
      setCart(previous);
      pushToast(result.error);
      return false;
    },
    [ensureCartId, pushToast, setCart],
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number): Promise<void> => {
      const previous = cartRef.current;
      setCart(optimisticUpdate(previous, lineId, quantity));
      const result = await updateCartLine(cartIdRef.current, lineId, quantity);
      if (result.ok) {
        setCart(result.cart);
      } else {
        setCart(previous);
        pushToast(result.error);
      }
    },
    [pushToast, setCart],
  );

  const removeLine = useCallback(
    async (lineId: string): Promise<void> => {
      const previous = cartRef.current;
      setCart(optimisticRemove(previous, lineId));
      const result = await removeCartLine(cartIdRef.current, lineId);
      if (result.ok) {
        setCart(result.cart);
      } else {
        setCart(previous);
        pushToast(result.error);
      }
    },
    [pushToast, setCart],
  );

  const applyDiscount = useCallback(
    async (code: string): Promise<boolean> => {
      const result = await applyCartDiscount(cartIdRef.current, code);
      if (result.ok) {
        setCart(result.cart);
        return true;
      }
      pushToast(result.error);
      return false;
    },
    [pushToast, setCart],
  );

  const value = useMemo<CartValue>(
    () => ({
      cart,
      isOpen,
      openCart,
      closeCart,
      addLine,
      updateLine,
      removeLine,
      applyDiscount,
    }),
    [cart, isOpen, openCart, closeCart, addLine, updateLine, removeLine, applyDiscount],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <CartToasts toasts={toasts} onDismiss={dismissToast} />
    </CartContext.Provider>
  );
}
