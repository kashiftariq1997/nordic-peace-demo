import Link from "next/link";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { BowIcon } from "@/icons";
import { ROUTES } from "@/constants";

/** Gift guide teaser band — soft blush CTA before the footer. */
export function GiftTeaser() {
  return (
    <section className="bg-blush-deep py-16 sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <BowIcon className="text-rose h-6 w-6" />
        <h2 className="font-heading text-plum max-w-2xl text-3xl leading-tight tracking-tight sm:text-4xl">
          Something soft for everyone on your list
        </h2>
        <p className="text-plum-soft max-w-md text-base leading-7">
          From silk sleep sets to little vanity treasures — explore the gift guide and find a
          present that feels like a hug.
        </p>
        <Link href={ROUTES.GIFT_GUIDE} className={buttonClassName()}>
          Explore the gift guide
        </Link>
      </Container>
    </section>
  );
}
