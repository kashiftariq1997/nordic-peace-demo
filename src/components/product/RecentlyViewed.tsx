"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/common";
// Direct file import (not the layout barrel): this is a Client Component and
// the barrel drags in Footer's inline "use cache", which breaks the build.
import { Container } from "@/components/layout/Container";
import { ROUTES } from "@/constants";
import {
  formatMoney,
  getRecentlyViewedSnapshot,
  getServerRecentlyViewedSnapshot,
  subscribeRecentlyViewed,
} from "@/utils";

type RecentlyViewedProps = {
  /** The page's own product — shown history always skips it. */
  currentHandle: string;
};

/**
 * Recently viewed rail (spec Step A) — reads localStorage snapshots through
 * useSyncExternalStore, so the server renders nothing and the rail appears
 * after hydration for returning visitors only.
 */
export function RecentlyViewed({ currentHandle }: RecentlyViewedProps) {
  const items = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewedSnapshot,
    getServerRecentlyViewedSnapshot,
  );
  const visible = useMemo(
    () => items.filter((item) => item.handle !== currentHandle),
    [items, currentHandle],
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="border-line bg-cream border-t py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeader eyebrow="Pick up where you left off" title="Recently viewed" />
        <ul className="flex gap-5 overflow-x-auto pb-2">
          {visible.map((item) => (
            <li key={item.handle} className="w-44 shrink-0">
              <Link href={ROUTES.product(item.handle)} className="group flex flex-col gap-3">
                <div className="bg-blush relative aspect-4/5 overflow-hidden rounded-3xl">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-heading text-rose-ink text-xl">Nordic Peace</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-plum group-hover:text-rose-ink text-base leading-snug transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-plum-soft text-sm">{formatMoney(item.price)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
