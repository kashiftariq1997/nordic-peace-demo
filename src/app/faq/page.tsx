import type { Metadata } from "next";
import Link from "next/link";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { ChevronIcon } from "@/icons";
import { FAQ_ITEMS, POLICIES, ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Shipping, returns, sizing and care — the quick answers before you ask.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <ContentHero
        eyebrow="FAQ"
        title="Good questions, soft answers"
        lede="Everything worth knowing before your order — shipping, sizing, returns and care."
      />

      <section className="bg-cream py-14 sm:py-16">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col">
            <div className="border-line border-t">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="border-line group border-b">
                  <summary className="text-plum hover:text-rose-ink flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronIcon className="text-rose-ink h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="text-plum-soft pb-5 text-sm leading-6">{item.answer}</p>
                </details>
              ))}
            </div>

            <div className="border-line bg-blush mt-12 flex flex-col items-center gap-4 rounded-3xl border px-6 py-10 text-center">
              <h2 className="font-heading text-plum text-2xl">Still curious?</h2>
              <p className="text-plum-soft max-w-md text-sm leading-6">
                If your answer isn&apos;t here, send us a note — or read the full policies below.
              </p>
              <Link href={ROUTES.CONTACT} className={buttonClassName({ size: "sm" })}>
                Contact us
              </Link>
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-1 text-sm">
                {POLICIES.map((policy) => (
                  <li key={policy.slug}>
                    <Link
                      href={ROUTES.policy(policy.slug)}
                      className="text-plum-soft hover:text-rose-ink underline underline-offset-4 transition-colors"
                    >
                      {policy.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
