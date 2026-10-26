import Link from "next/link";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { BowIcon } from "@/icons";
import { ROUTES } from "@/constants";

/** Branded 404 — also shown when notFound() is thrown by a route (bad handles). */
export default function NotFound() {
  return (
    <section className="bg-blush flex items-center">
      <Container className="flex flex-col items-center gap-5 py-24 text-center">
        <BowIcon className="text-rose h-7 w-7" />
        <p className="text-rose-ink text-xs font-medium tracking-[0.3em] uppercase">404</p>
        <h1 className="font-heading text-plum max-w-xl text-4xl leading-tight tracking-tight sm:text-5xl">
          This page drifted away
        </h1>
        <p className="text-plum-soft max-w-md text-sm leading-6">
          The piece you were looking for is no longer here — or perhaps it never was. Let&apos;s get
          you back to something soft.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href={ROUTES.HOME} className={buttonClassName()}>
            Back home
          </Link>
          <Link href={ROUTES.COLLECTION_ALL} className={buttonClassName({ variant: "secondary" })}>
            Shop all
          </Link>
        </div>
        <Link
          href={ROUTES.GIFT_GUIDE}
          className="text-plum-soft hover:text-rose-ink text-sm underline underline-offset-4 transition-colors"
        >
          Or browse the gift guide
        </Link>
      </Container>
    </section>
  );
}
