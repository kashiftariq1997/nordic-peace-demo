import Image from "next/image";
import Link from "next/link";
import heroOne from "@/images/hero-1.webp";
import heroTwo from "@/images/hero-2.jpg";
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
    <section className="bg-blush relative">
      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
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

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="bg-cream shadow-soft relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/70">
            <PhotoWithFallback
              src={heroOne}
              fallbackSrc="/images/products/p-rosewater-silk-pajama-set.svg"
              alt="A collage of soft sleepwear, cozy bedding, and relaxed mornings"
              fallbackAlt="Illustration of the Rosewater Silk Pajama Set"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
              preload
            />
          </div>
          <div className="bg-cream shadow-soft absolute -bottom-6 -left-4 hidden aspect-square w-36 overflow-hidden rounded-3xl border-4 border-white sm:block sm:w-44">
            <PhotoWithFallback
              src={heroTwo}
              fallbackSrc="/images/products/p-cloud-knit-throw.svg"
              alt="A calm bedroom with a soft blush throw and layered bedding"
              fallbackAlt="Illustration of the Cloud Knit Throw"
              fill
              sizes="176px"
              className="object-cover"
            />
          </div>
          <div className="bg-cream shadow-soft absolute -top-5 -right-3 hidden aspect-square w-32 overflow-hidden rounded-3xl border-4 border-white sm:block sm:w-40">
            <Image
              src="/images/products/p-blush-velvet-jewelry-box.svg"
              alt="Illustration of a blush velvet jewelry box"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
      <ScallopEdge />
    </section>
  );
}
