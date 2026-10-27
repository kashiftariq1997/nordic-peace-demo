import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";
import { getShopifyAccountHref } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Account",
  description: "Customer account access for Nordic Peace.",
  alternates: { canonical: ROUTES.ACCOUNT },
  // Account routes shouldn't be indexed (spec §11).
  robots: { index: false, follow: false },
};

/**
 * Customer account page. With Shopify configured this hands off to the
 * store's hosted account page (https://<domain>/account); in demo mode it
 * explains honestly that no sign-in exists yet and how to enable it.
 */
export default function AccountPage() {
  const shopifyAccountHref = getShopifyAccountHref();
  if (shopifyAccountHref) {
    redirect(shopifyAccountHref);
  }

  return (
    <>
      <ContentHero
        eyebrow="Account"
        title="Your account"
        lede="Where customer sign-in lives — and what it means that you're seeing this page."
      />
      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <div className="border-line bg-blush/60 shadow-soft max-w-2xl rounded-3xl border p-6 sm:p-8">
            <h2 className="font-heading text-plum text-2xl tracking-wide uppercase">
              This store is running in demo mode
            </h2>
            <p className="text-plum-soft mt-4 text-sm leading-6">
              Nordic Peace is currently serving its local demo catalog — no Shopify store is
              connected, so there is no sign-in, no order history, and nothing about you is stored.
              Your bag and wishlist live only in this browser.
            </p>
            <p className="text-plum-soft mt-4 text-sm leading-6">
              To enable real customer accounts, set{" "}
              <code className="text-plum bg-blush-deep/60 rounded px-1.5 py-0.5">
                SHOPIFY_STORE_DOMAIN
              </code>{" "}
              and{" "}
              <code className="text-plum bg-blush-deep/60 rounded px-1.5 py-0.5">
                SHOPIFY_STOREFRONT_ACCESS_TOKEN
              </code>{" "}
              and redeploy — the README&apos;s Shopify setup section walks through the whole
              process. Once configured, the account icon in the header opens your store&apos;s
              hosted account page at{" "}
              <code className="text-plum bg-blush-deep/60 rounded px-1.5 py-0.5">/account</code>{" "}
              instead of this notice.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ROUTES.COLLECTION_ALL} className={buttonClassName({})}>
                Continue shopping
              </Link>
              <Link href={ROUTES.CONTACT} className={buttonClassName({ variant: "secondary" })}>
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
