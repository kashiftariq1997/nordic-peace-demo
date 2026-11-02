import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ourStoryPhoto from "@/images/ourStory.webp";
import { ContentHero } from "@/components/content";
import { Container } from "@/components/layout";
import { buttonClassName } from "@/components/ui";
import { ROUTES, SITE_NAME } from "@/constants";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How Nordic Peace began — a small studio making soft, romantic pieces for slow mornings and unhurried nights.",
  alternates: { canonical: "/our-story" },
};

const PRINCIPLES = [
  {
    title: "Softness first",
    body: "Every fabric is chosen against the cheek before it's ever chosen for a sketch. If it isn't soft enough to nap in, it doesn't ship.",
  },
  {
    title: "Small batches",
    body: "We make in short runs so nothing is rushed and nothing is wasted — restocks land quietly, a few pieces at a time.",
  },
  {
    title: "Kept, not tossed",
    body: "These are the pieces you'll reach for for years: pre-washed, double-stitched, and cut to soften rather than sag.",
  },
];

export default function OurStoryPage() {
  return (
    <>
      <ContentHero
        eyebrow="Our story"
        title="Slowly does it, since day one"
        lede={`${SITE_NAME} began with one simple wish: mornings that start gently, and nights that end the same way.`}
      />

      <section className="bg-cream py-14 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="bg-blush shadow-soft relative aspect-[4/5] overflow-hidden rounded-[2.5rem] sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={ourStoryPhoto}
              alt="A softly lit bedroom with cream bedding, knitted throws, plants, and woven accents"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          </div>

          <div className="flex max-w-xl flex-col gap-5">
            <p className="text-rose-ink text-xs font-medium tracking-[0.3em] uppercase">
              The beginning
            </p>
            <h2 className="font-heading text-plum text-3xl leading-tight tracking-tight sm:text-4xl">
              A studio built around the quiet hours
            </h2>
            <p className="text-plum-soft text-base leading-7">
              It started with a single set of pajamas — cut from washed silk, sewn slowly, worn
              until they were the softest thing in the house. Friends asked for a pair, then their
              sisters did, and the studio grew the way good mornings do: unhurried and without fuss.
            </p>
            <p className="text-plum-soft text-base leading-7">
              Today we draw everything in-house and make in small batches, from the ruffle on a cuff
              to the bow on a gift box. Nothing is loud. Everything is meant to be lived in, washed
              often, and kept for a long time.
            </p>
            <p className="font-heading text-rose-ink text-xl italic">
              From our studio to your mornings.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-cream pb-14 sm:pb-20">
        <Container className="flex flex-col gap-8">
          <div className="border-line grid gap-6 border-t pt-10 sm:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="flex flex-col gap-3">
                <h3 className="font-heading text-plum text-2xl">{principle.title}</h3>
                <p className="text-plum-soft text-sm leading-6">{principle.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-blush">
        <Container className="flex flex-col items-center gap-5 py-16 text-center sm:py-20">
          <p className="font-heading text-plum max-w-2xl text-3xl leading-snug tracking-tight italic sm:text-4xl">
            “The softest things in a home are the ones that ask nothing of you.”
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href={ROUTES.COLLECTION_ALL} className={buttonClassName()}>
              Shop the collection
            </Link>
            <Link href={ROUTES.LOOKBOOK} className={buttonClassName({ variant: "secondary" })}>
              See the lookbook
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
