"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type PhotoWithFallbackProps = Omit<ImageProps, "onError" | "src"> & {
  src: ImageProps["src"];
  fallbackSrc: string;
  fallbackAlt: string;
};

export function PhotoWithFallback({
  src,
  fallbackSrc,
  fallbackAlt,
  alt,
  ...props
}: PhotoWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      {...props}
      src={failed ? fallbackSrc : src}
      alt={failed ? fallbackAlt : alt}
      onError={() => setFailed(true)}
    />
  );
}
