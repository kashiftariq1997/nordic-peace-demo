import Link from "next/link";
import { AccountIcon, BagIcon, SearchIcon } from "@/icons";
import { NAV_LINKS, ROUTES, SITE_NAME } from "@/constants";
import { MobileMenu } from "./MobileMenu";

/**
 * Sticky site header. Server Component — interactivity lives in MobileMenu.
 * The cart badge is static until the cart provider lands (Phase 4), where it
 * becomes a client component driven by cart state.
 */
export function Header() {
  return (
    <header className="border-line bg-cream/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-6 lg:px-8">
        <MobileMenu />

        <Link
          href={ROUTES.HOME}
          className="font-heading text-plum hover:text-rose-ink text-lg tracking-[0.22em] uppercase transition-colors sm:text-xl"
        >
          {SITE_NAME}
        </Link>

        <nav aria-label="Main navigation" className="ml-10 hidden items-center gap-5 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-plum hover:text-rose-ink flex h-11 items-center text-[13px] font-medium tracking-[0.12em] uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center">
          <Link
            href={ROUTES.SEARCH}
            aria-label="Search"
            className="text-plum hover:text-rose-ink flex h-11 w-11 items-center justify-center transition-colors"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link
            href={ROUTES.ACCOUNT}
            aria-label="Account"
            className="text-plum hover:text-rose-ink hidden h-11 w-11 items-center justify-center transition-colors sm:flex"
          >
            <AccountIcon className="h-5 w-5" />
          </Link>
          {/* Cart count + drawer arrive in Phase 4 (client cart provider). */}
          <button
            type="button"
            aria-label="Cart, 0 items"
            className="text-plum hover:text-rose-ink relative flex h-11 w-11 items-center justify-center transition-colors"
          >
            <BagIcon className="h-5 w-5" />
            <span
              aria-hidden="true"
              className="bg-rose-ink text-cream absolute top-1.5 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] leading-none font-medium"
            >
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
