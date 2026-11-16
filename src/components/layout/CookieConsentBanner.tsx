"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  getMarketingConsentSnapshot,
  getServerMarketingConsentSnapshot,
  identifyKlaviyoProfile,
  loadKlaviyoScript,
  saveMarketingConsent,
  subscribeMarketingConsent,
} from "@/utils";
import { loadGA4, stopGA4 } from "@/utils/ga4";

type CookieConsentBannerProps = {
  /** Klaviyo public site ID from the server — null when tracking is off. */
  klaviyoPublicKey: string | null;
  /** GA4 measurement ID — null when analytics is not configured. */
  gaMeasurementId: string | null;
};

/**
 * Cookie consent banner (spec §6) — gates analytics and marketing tracking.
 *
 * Consent is read from localStorage through useSyncExternalStore, so the SSR
 * HTML stays neutral and the banner only appears for undecided visitors after
 * hydration. Accepting loads configured trackers; declining persists a
 * refusal so no marketing or analytics script is loaded.
 */
export function CookieConsentBanner({
  klaviyoPublicKey,
  gaMeasurementId,
}: CookieConsentBannerProps) {
  const bannerRef = useRef<HTMLElement>(null);
  const consent = useSyncExternalStore(
    subscribeMarketingConsent,
    getMarketingConsentSnapshot,
    getServerMarketingConsentSnapshot,
  );

  useEffect(() => {
    if (consent === "granted" && klaviyoPublicKey) {
      loadKlaviyoScript(klaviyoPublicKey);
      identifyKlaviyoProfile();
    }
  }, [consent, klaviyoPublicKey]);

  useEffect(() => {
    if (consent === "granted" && gaMeasurementId) {
      loadGA4();
    } else {
      stopGA4();
    }
  }, [consent, gaMeasurementId]);

  // Publish the live banner height as --cookie-banner-h so bottom-fixed UI
  // (the sticky add-to-cart bar) can sit above it instead of being covered.
  // Cleared on unmount/decision, so the bar drops back to the viewport edge.
  useEffect(() => {
    if (consent !== "pending") return;
    const element = bannerRef.current;
    if (!element) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--cookie-banner-h", `${element.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.setProperty("--cookie-banner-h", "0px");
    };
  }, [consent]);

  if (consent !== "pending") {
    return null;
  }

  return (
    <section
      ref={bannerRef}
      aria-label="Cookie consent"
      className="border-line bg-blush text-plum shadow-soft fixed inset-x-0 bottom-0 z-40 border-t px-5 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-plum-soft max-w-2xl text-sm leading-6">
          We use cookies for analytics and marketing — only if you accept. Decline and nothing
          beyond what&apos;s strictly necessary is stored. See our{" "}
          <Link
            href={ROUTES.policy("privacy")}
            className="text-rose-ink underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="secondary" size="sm" onClick={() => saveMarketingConsent(false)}>
            Decline
          </Button>
          <Button size="sm" onClick={() => saveMarketingConsent(true)}>
            Accept
          </Button>
        </div>
      </div>
    </section>
  );
}
