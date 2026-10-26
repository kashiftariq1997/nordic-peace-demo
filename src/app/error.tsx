"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui";
import { ROUTES } from "@/constants";

type ErrorProps = {
  error: unknown;
  /** Next 16 names the recovery function `retry` (formerly `reset`). */
  retry: () => void;
};

/** Route-segment error boundary — logs, offers a retry, and never dead-ends. */
export default function Error({ error, retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-blush flex items-center">
      {/* Container markup inlined: the @/components/layout barrel pulls the
          server-only Footer (inline "use cache") into this client bundle. */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-rose-ink text-xs font-medium tracking-[0.3em] uppercase">
          Something went wrong
        </p>
        <h1 className="font-heading text-plum max-w-xl text-4xl leading-tight tracking-tight sm:text-5xl">
          Something came undone
        </h1>
        <p className="text-plum-soft max-w-md text-sm leading-6">
          An unexpected error interrupted this page. Try again — and if it keeps happening,
          we&apos;d love to hear about it so we can fix it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button onClick={retry}>Try again</Button>
          <Link href={ROUTES.CONTACT} className={buttonClassName({ variant: "secondary" })}>
            Contact us
          </Link>
        </div>
        <Link
          href={ROUTES.HOME}
          className="text-plum-soft hover:text-rose-ink text-sm underline underline-offset-4 transition-colors"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
