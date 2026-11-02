import Link from "next/link";
import heroOne from "@/images/hero-1.webp";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { BowIcon } from "@/icons";
import { ROUTES, SITE_DESCRIPTION } from "@/constants";
import { PhotoWithFallback } from "./PhotoWithFallback";

/** Scalloped edge strip — soft coquette divider, sits on the section below. */
function ScallopEdge() {
  const arcs = Array.from({ length: 24 }, () => "a30,18 0 0 1 60,0").join(" ");
  return (
    <svg
      className="text-cream pointer-events-none -mb-px block h-8 w-full"
      viewBox="0 0 1440 32"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={`M0 32 V14 ${arcs} V32 Z`} fill="currentColor" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="bg-blush relative isolate overflow-hidden">
      <PhotoWithFallback
        src={heroOne}
        fallbackSrc="/images/products/p-rosewater-silk-pajama-set.svg"
        alt="A collage of soft sleepwear, cozy bedding, and relaxed mornings"
        fallbackAlt="Illustration of the Rosewater Silk Pajama Set"
        fill
        sizes="100vw"
        className="object-cover"
        preload
      />
      <div className="from-cream/95 via-cream/85 to-cream/60 lg:from-cream/90 lg:via-cream/70 lg:to-cream/10 absolute inset-0 bg-gradient-to-r" />
      <Container className="relative z-10 flex min-h-[36rem] items-center py-16 sm:min-h-[42rem] sm:py-24">
        <div className="flex max-w-xl flex-col items-start gap-6">
          <p className="text-rose-ink flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase">
            <BowIcon className="h-4 w-4" />
            Romantic sleepwear & cozy home
          </p>
          <h1 className="font-heading text-plum text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Softly <em className="text-rose-ink">does it</em>
          </h1>
          <p className="text-plum-soft max-w-md text-base leading-7">{SITE_DESCRIPTION}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={ROUTES.COLLECTION_NEW_ARRIVALS} className={buttonClassName()}>
              Shop new arrivals
            </Link>
            <Link href={ROUTES.OUR_STORY} className={buttonClassName({ variant: "secondary" })}>
              Our story
            </Link>
          </div>
        </div>
      </Container>
      <ScallopEdge />
    </section>
  );
}
