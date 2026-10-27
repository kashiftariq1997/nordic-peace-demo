"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { ChevronIcon, CloseIcon } from "@/icons";
import { useFocusTrap } from "@/utils";
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
 * :focus-visible rule). Clicking/tapping the main image opens an accessible
 * lightbox (focus trap, Escape, arrow keys, per-image alt text); on fine
 * pointers the main image zooms toward the cursor on hover — the transform is
 * written straight to the img so hover costs no re-render, and the global
 * prefers-reduced-motion rule neutralizes the transition. Falls back to brand
 * art when a product has no images.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainRef = useRef<HTMLButtonElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const current = images[active];

  const resetZoom = () => {
    const image = zoomImageRef.current;
    if (!image) return;
    image.style.transform = "";
    image.style.transformOrigin = "";
  };

  const openLightbox = () => {
    resetZoom();
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    mainRef.current?.focus();
  };

  const step = (delta: number) => {
    setActive((index) => (index + delta + images.length) % images.length);
  };

  // Escape closes (returning focus to the main image); Tab stays inside.
  useFocusTrap(lightboxRef, lightboxOpen, closeLightbox);

  // Initial focus lands on the close button; background scroll locks while open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightboxCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  // Desktop hover zoom: track the cursor on fine pointers only, mutating the
  // image styles directly (touch devices get the lightbox on tap instead).
  const onMainPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;
    const image = zoomImageRef.current;
    if (!image) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = "scale(2)";
  };

  if (!current) {
    return (
      <div className="bg-blush flex aspect-4/5 items-center justify-center rounded-3xl">
        <span className="font-heading text-rose-ink text-4xl">Nordic Peace</span>
      </div>
    );
  }

  const alt = current.altText || title;

  return (
    <div className="flex flex-col gap-3">
      <button
        ref={mainRef}
        type="button"
        onClick={openLightbox}
        onPointerMove={onMainPointerMove}
        onPointerLeave={resetZoom}
        aria-haspopup="dialog"
        aria-label={`Open image ${active + 1} of ${images.length} enlarged`}
        className="bg-blush relative aspect-4/5 w-full cursor-zoom-in overflow-hidden rounded-3xl"
      >
        <Image
          ref={zoomImageRef}
          src={current.url}
          alt={alt}
          fill
          priority={active === 0}
          sizes={MAIN_SIZES}
          className="object-cover transition-transform duration-300 ease-out"
        />
      </button>

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

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[70]">
          <div
            aria-hidden="true"
            className="np-fade-in bg-plum/85 absolute inset-0 backdrop-blur-sm"
            onClick={closeLightbox}
          />

          <div
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Image viewer — ${title}`}
            onKeyDown={(event) => {
              if (images.length < 2) return;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                step(-1);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                step(1);
              }
            }}
            className="np-fade-in absolute inset-0 flex flex-col p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <p aria-live="polite" className="text-cream text-sm">
                Image {active + 1} of {images.length}
              </p>
              <button
                ref={lightboxCloseRef}
                type="button"
                aria-label="Close image viewer"
                onClick={closeLightbox}
                className="text-cream hover:text-blush flex h-11 w-11 items-center justify-center rounded-full transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <Image
                src={current.url}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => step(-1)}
                    className="bg-cream/15 text-cream hover:bg-cream/30 absolute top-1/2 left-0 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
                  >
                    <ChevronIcon className="h-6 w-6 rotate-90" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => step(1)}
                    className="bg-cream/15 text-cream hover:bg-cream/30 absolute top-1/2 right-0 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
                  >
                    <ChevronIcon className="h-6 w-6 -rotate-90" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
