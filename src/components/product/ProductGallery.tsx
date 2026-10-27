"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";

type ProductGalleryProps = {
  images: readonly ProductImage[];
  title: string;
};

const THUMBNAIL_SIZES = "80px";
const MAIN_SIZES = "(min-width: 1024px) 45vw, (min-width: 768px) 60vw, 100vw";

/**
 * Product image gallery — large main image with a clickable thumbnail strip
 * (active thumbnail carries an outline; keyboard focus comes from the global
 * :focus-visible rule). Falls back to brand art when a product has no images.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return (
      <div className="bg-blush flex aspect-4/5 items-center justify-center rounded-3xl">
        <span className="font-heading text-rose-ink/40 text-4xl">Nordic Peace</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-blush relative aspect-4/5 overflow-hidden rounded-3xl">
        <Image
          src={current.url}
          alt={current.altText || title}
          fill
          priority={active === 0}
          sizes={MAIN_SIZES}
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-3">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${images.length}: ${image.altText || title}`}
                aria-current={index === active}
                className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-colors ${
                  index === active ? "border-plum" : "border-line hover:border-blush-deep"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes={THUMBNAIL_SIZES}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
