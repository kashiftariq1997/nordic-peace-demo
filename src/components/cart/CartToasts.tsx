"use client";

import { CloseIcon } from "@/icons";

export type CartToast = {
  id: string;
  message: string;
};

type CartToastsProps = {
  toasts: readonly CartToast[];
  onDismiss: (id: string) => void;
};

/** Error toasts (bottom-right, above the drawer) — one per failed cart action. */
export function CartToasts({ toasts, onDismiss }: CartToastsProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-24 z-[60] flex flex-col items-end gap-2 sm:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="bg-plum text-cream shadow-soft flex max-w-xs items-center gap-3 rounded-full py-3 pr-3 pl-5 text-sm"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-cream/70 hover:text-cream flex h-7 w-7 shrink-0 items-center justify-center"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
