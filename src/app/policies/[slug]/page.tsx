import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { BreadcrumbJsonLd } from "@/components/seo";
import { POLICIES, POLICY_SLUGS, ROUTES, getPolicy } from "@/constants";
import { formatFreeShippingThreshold } from "@/lib";
import { getShopCurrency } from "@/services";

type Props = PageProps<"/policies/[slug]">;

/** All policies are static content — prerender every slug. */
export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) {
    return { title: "Policy not found" };
  }
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: ROUTES.policy(slug) },
  };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) {
    notFound();
  }
  // {threshold} in policy copy → live env amount in the store's Shopify currency.
  const thresholdCopy = formatFreeShippingThreshold(await getShopCurrency());

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: ROUTES.HOME },
          { name: policy.title, path: ROUTES.policy(slug) },
        ]}
      />
      <ContentHero eyebrow="Legal" title={policy.title} lede={policy.description} />

      <section className="bg-cream py-14 sm:py-16">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-10">
            <p className="text-plum-soft border-line border-b pb-6 text-xs tracking-wide">
              {policy.updated} · Nordic Peace
            </p>

            {policy.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-3">
                <h2 className="font-heading text-plum text-2xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-plum-soft text-sm leading-7">
                    {paragraph.replace("{threshold}", thresholdCopy)}
                  </p>
                ))}
              </section>
            ))}

            <div className="border-line flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-8 text-sm">
              <span className="text-rose-ink text-xs font-medium tracking-[0.25em] uppercase">
                More policies
              </span>
              {POLICIES.filter((entry) => entry.slug !== policy.slug).map((entry) => (
                <Link
                  key={entry.slug}
                  href={ROUTES.policy(entry.slug)}
                  className="text-plum-soft hover:text-rose-ink underline underline-offset-4 transition-colors"
                >
                  {entry.title}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
