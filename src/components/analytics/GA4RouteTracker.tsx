"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  getMarketingConsentSnapshot,
  getServerMarketingConsentSnapshot,
  subscribeMarketingConsent,
} from "@/utils";
import { trackGA4Event } from "@/utils/ga4";

export function GA4RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const previousPageLocation = useRef<string | null>(null);
  const consent = useSyncExternalStore(
    subscribeMarketingConsent,
    getMarketingConsentSnapshot,
    getServerMarketingConsentSnapshot,
  );

  useEffect(() => {
    if (consent !== "granted" || !pathname) return;

    const pagePath = search ? `${pathname}?${search}` : pathname;
    const pageLocation = window.location.href;
    trackGA4Event("page_view", {
      page_path: pagePath,
      page_location: pageLocation,
      page_title: document.title,
      page_referrer: previousPageLocation.current ?? document.referrer,
    });
    previousPageLocation.current = pageLocation;
  }, [consent, pathname, search]);

  return null;
}
