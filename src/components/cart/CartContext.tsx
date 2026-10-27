"use client";

import { createContext, useContext } from "react";
import type { CartLineInput, CartState } from "@/types";

export type CartValue = {
  cart: CartState;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Optimistically adds the line, opens the drawer; true on success. */
  addLine: (line: CartLineInput) => Promise<boolean>;
  /** Optimistically changes quantity; reconciles with the server after. */
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  /** Optimistically removes the line; reconciles with the server after. */
  removeLine: (lineId: string) => Promise<void>;
  /** Applies a code (empty string clears); true when accepted. */
  applyDiscount: (code: string) => Promise<boolean>;
};

export const CartContext = createContext<CartValue | null>(null);

/** Cart state + actions — throws outside <CartProvider>. */
export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }
  return value;
}
