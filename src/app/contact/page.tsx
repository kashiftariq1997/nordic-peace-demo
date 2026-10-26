import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm, ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { ROUTES, SITE_EMAIL } from "@/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about an order, sizing or anything else — we reply within two business days.",
};

type ContactDetail = {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
  readonly link?: string;
};

const CONTACT_DETAILS: readonly ContactDetail[] = [
  { label: "Email", value: SITE_EMAIL, href: `mailto:${SITE_EMAIL}` },
  { label: "Response time", value: "Within two business days, Monday to Friday." },
  { label: "Press & wholesale", value: "Email us with the word “Press” in the subject line." },
  {
    label: "Quick answers",
    value: "Shipping, returns and sizing are covered in the FAQ.",
    link: ROUTES.FAQ,
  },
];

export default function ContactPage() {
  return (
    <>
      <ContentHero
        eyebrow="Contact"
        title="Say hello, softly"
        lede="Questions about an order, a size, or a fabric? We read every note and reply within two business days."
      />

      <section className="bg-cream py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="border-line bg-blush/50 rounded-3xl border p-6 sm:p-8">
              <h2 className="font-heading text-plum mb-6 text-2xl">Send us a note</h2>
              <ContactForm />
            </div>

            <div className="flex flex-col gap-6">
              <dl className="border-line flex flex-col gap-6 border-t pt-6">
                {CONTACT_DETAILS.map((detail) => (
                  <div key={detail.label} className="flex flex-col gap-1.5">
                    <dt className="text-rose-ink text-xs font-medium tracking-[0.25em] uppercase">
                      {detail.label}
                    </dt>
                    <dd className="text-plum text-sm leading-6">
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="hover:text-rose-ink underline underline-offset-4 transition-colors"
                        >
                          {detail.value}
                        </a>
                      ) : detail.link ? (
                        <Link
                          href={detail.link}
                          className="hover:text-rose-ink underline underline-offset-4 transition-colors"
                        >
                          Read the FAQ →
                        </Link>
                      ) : (
                        detail.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-line text-plum-soft rounded-3xl border bg-white p-5 text-sm leading-6">
                Looking for order status, exchanges, or delivery times? Most answers live in our{" "}
                <Link
                  href={ROUTES.policy("shipping")}
                  className="text-plum hover:text-rose-ink underline underline-offset-4 transition-colors"
                >
                  shipping
                </Link>{" "}
                and{" "}
                <Link
                  href={ROUTES.policy("returns")}
                  className="text-plum hover:text-rose-ink underline underline-offset-4 transition-colors"
                >
                  returns
                </Link>{" "}
                policies.
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
