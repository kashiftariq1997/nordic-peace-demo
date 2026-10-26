import { Container } from "@/components/layout";
import { cn } from "@/utils";

export type ContentHeroProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  className?: string;
};

/** Shared intro band for the brand pages (story, FAQ, contact, policies…). */
export function ContentHero({ eyebrow, title, lede, className }: ContentHeroProps) {
  return (
    <section className="bg-blush">
      <Container
        className={cn("flex flex-col items-center gap-4 py-14 text-center sm:py-16", className)}
      >
        <p className="text-rose-ink text-xs font-medium tracking-[0.3em] uppercase">{eyebrow}</p>
        <h1 className="font-heading text-plum max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        {lede ? <p className="text-plum-soft max-w-2xl text-base leading-7">{lede}</p> : null}
      </Container>
    </section>
  );
}
