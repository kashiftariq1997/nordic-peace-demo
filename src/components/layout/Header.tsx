import Link from "next/link";
import { CartBadge } from "@/components/cart";
import { AccountIcon, SearchIcon } from "@/icons";
import { NAV_LINKS, ROUTES, SITE_NAME } from "@/constants";
import { getShopifyAccountHref } from "@/lib/shopify";
import { MobileMenu } from "./MobileMenu";

const ACCOUNT_LINK_CLASS =
  "text-plum hover:text-rose-ink hidden h-11 w-11 items-center justify-center transition-colors sm:flex";

/**
 * Sticky site header. Server Component — the cart badge is a client child
 * driven by the cart provider; interactivity lives in MobileMenu. The account
 * link points at Shopify's hosted account when a store is configured, and at
 * the demo-mode /account page otherwise.
 */
export function Header() {
  const accountHref = getShopifyAccountHref();

  return (
    <header className="border-line bg-cream/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-6 lg:px-8">
        <MobileMenu accountHref={accountHref} />

        <Link
          href={ROUTES.HOME}
          className="font-heading text-plum hover:text-rose-ink flex min-h-11 items-center text-base tracking-[0.14em] uppercase transition-colors sm:text-xl sm:tracking-[0.22em]"
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
          {accountHref ? (
            <a
              href={accountHref}
              rel="noopener"
              aria-label="Account"
              className={ACCOUNT_LINK_CLASS}
            >
              <AccountIcon className="h-5 w-5" />
            </a>
          ) : (
            <Link href={ROUTES.ACCOUNT} aria-label="Account" className={ACCOUNT_LINK_CLASS}>
              <AccountIcon className="h-5 w-5" />
            </Link>
          )}
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
