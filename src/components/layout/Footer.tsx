import Link from "next/link";
import { BowIcon } from "@/icons";
import {
  FOOTER_LINK_COLUMNS,
  FREE_SHIPPING_THRESHOLD,
  ROUTES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/constants";
import { NewsletterForm } from "./NewsletterForm";

/**
 * Site footer. Server Component — NewsletterForm is the only client piece.
 * Social links are clearly marked placeholders (see SOCIAL_LINKS in
 * src/constants/site.ts).
 */

// Copyright year is a timestamp-like value: Cache Components requires it to be
// cached rather than read at prerender time (see docs "Random values and
// timestamps").
async function getCopyrightYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-line bg-blush border-t">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <section
          aria-labelledby="footer-newsletter-heading"
          className="border-line bg-cream mt-10 rounded-3xl border p-6 sm:p-8 lg:mt-14"
        >
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-rose-ink mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase">
                <BowIcon className="h-3.5 w-3.5" />
                Newsletter
              </p>
              <h2 id="footer-newsletter-heading" className="font-heading text-plum text-3xl">
                A little note, now and then
              </h2>
              <p className="text-plum-soft mt-2 max-w-md text-sm leading-6">
                New arrivals, cozy edits and notes from the studio — straight to your inbox. No
                noise.
              </p>
            </div>
            <NewsletterForm source="footer" />
          </div>
        </section>

        {/* Brand + link columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-8 lg:py-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href={ROUTES.HOME}
              className="font-heading text-plum hover:text-rose-ink text-xl tracking-[0.22em] uppercase"
            >
              {SITE_NAME}
            </Link>
            <p className="text-plum-soft mt-4 max-w-sm text-sm leading-6">{SITE_DESCRIPTION}</p>

            {/* PLACEHOLDER social links — replace hrefs with the brand's real profiles. */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Placeholder link — replace with the brand's profile"
                    className="text-plum hover:text-rose-ink flex min-h-11 items-center text-sm font-medium underline-offset-4 transition-colors hover:underline"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_LINK_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`Footer: ${column.title}`}>
              <h3 className="text-plum-soft text-xs font-medium tracking-[0.2em] uppercase">
                {column.title}
              </h3>
              <ul className="mt-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-plum hover:text-rose-ink flex min-h-11 items-center text-sm underline-offset-4 transition-colors hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-line/80 text-plum-soft flex flex-col gap-3 border-t py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            Checkout is processed by Shopify · Complimentary shipping on orders over $
            {FREE_SHIPPING_THRESHOLD}
          </p>
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
