import Link from "next/link";
import { buttonClassName } from "@/components/ui";
import { BowIcon } from "@/icons";
import { ROUTES, SITE_DESCRIPTION } from "@/constants";

/**
 * Placeholder homepage — the full storefront home arrives in Phase 3.
 */
export default function Home() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <BowIcon className="text-rose h-5 w-5" />
      <p className="text-rose-ink text-xs font-medium tracking-[0.3em] uppercase">
        Softly under construction
      </p>
      <h1 className="font-heading text-plum text-5xl font-medium tracking-tight sm:text-6xl">
        Nordic Peace
      </h1>
      <p className="text-plum-soft max-w-md text-base leading-7">{SITE_DESCRIPTION}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        <Link href={ROUTES.COLLECTION_ALL} className={buttonClassName()}>
          Shop all
        </Link>
        <Link href={ROUTES.OUR_STORY} className={buttonClassName({ variant: "secondary" })}>
          Our story
        </Link>
      </div>
    </section>
  );
}
