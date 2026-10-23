"use client";

import type { ReactNode } from "react";
import { useMounted } from "@/hooks";

type ClientOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const mounted = useMounted();
  return <>{mounted ? children : fallback}</>;
}
