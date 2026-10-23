import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { BowIcon } from "@/icons";
import { ROUTES } from "@/constants";

/** Editorial brand band — story pitch with an illustration. */
export function StoryBand() {
  return (
    <section className="bg-plum text-cream py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="bg-plum-soft/40 relative aspect-square overflow-hidden rounded-[2.5rem]">
          <Image
            src="/images/collections/c-cozy-home.svg"
            alt="Illustration of layered cozy bedding"
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        </div>
        <div className="flex max-w-xl flex-col items-start gap-6">
          <p className="text-blush flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase">
            <BowIcon className="h-4 w-4" />
            Our story
          </p>
          <h2 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
            Made for the <em className="text-blush">softest</em> hours of the day
          </h2>
          <p className="text-blush/85 text-base leading-7">
            Nordic Peace began with a simple wish — that the moments no one else sees could feel
            just as considered as the rest. Every set, sham and little vanity piece is chosen for
            how it feels at home: unhurried, tender, and quietly yours.
          </p>
          <Link
            href={ROUTES.OUR_STORY}
            className={buttonClassName({
              variant: "secondary",
              className: "border-cream text-cream hover:border-blush hover:text-blush",
            })}
          >
            Read our story
          </Link>
        </div>
      </Container>
    </section>
  );
}
