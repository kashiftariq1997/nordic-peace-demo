"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CloseIcon, MenuIcon, SearchIcon, AccountIcon } from "@/icons";
import { NAV_LINKS, ROUTES, SITE_NAME } from "@/constants";

/**
 * Mobile navigation: hamburger toggle (visible below xl) plus a drawer that
 * slides in from the left. Handles Escape-to-close, body scroll lock and
 * focus return to the toggle.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        className="text-plum hover:text-rose-ink flex h-11 w-11 items-center justify-center transition-colors xl:hidden"
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Mouse-only convenience; Escape and the close button cover keyboard. */}
          <div
            aria-hidden="true"
            className="np-fade-in bg-plum/40 absolute inset-0 backdrop-blur-sm"
            onClick={close}
          />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="np-drawer-in border-line bg-cream shadow-soft absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto rounded-r-3xl border-r focus:outline-none"
          >
            <div className="border-line flex h-16 items-center justify-between border-b px-4">
              <Link
                href={ROUTES.HOME}
                className="font-heading text-plum text-lg tracking-[0.2em] uppercase"
                onClick={close}
              >
                {SITE_NAME}
              </Link>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close menu"
                className="text-plum hover:text-rose-ink flex h-11 w-11 items-center justify-center transition-colors"
                onClick={close}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Main menu" className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-line/70 font-heading text-plum hover:text-rose-ink flex min-h-12 items-center border-b text-2xl transition-colors last:border-b-0"
                  onClick={close}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-line mt-auto border-t px-6 py-5">
              <div className="flex items-center gap-6">
                <Link
                  href={ROUTES.SEARCH}
                  className="text-plum hover:text-rose-ink flex min-h-11 items-center gap-2 text-sm font-medium transition-colors"
                  onClick={close}
                >
                  <SearchIcon className="h-4 w-4" />
                  Search
                </Link>
                <Link
                  href={ROUTES.ACCOUNT}
                  className="text-plum hover:text-rose-ink flex min-h-11 items-center gap-2 text-sm font-medium transition-colors"
                  onClick={close}
                >
                  <AccountIcon className="h-4 w-4" />
                  Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
