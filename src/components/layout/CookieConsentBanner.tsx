"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  getMarketingConsentSnapshot,
  getServerMarketingConsentSnapshot,
  loadKlaviyoScript,
  saveMarketingConsent,
  subscribeMarketingConsent,
} from "@/utils";

type CookieConsentBannerProps = {
  /** Klaviyo public site ID from the server — null when tracking is off. */
  klaviyoPublicKey: string | null;
};

/**
 * Cookie consent banner (spec §6) — gates all Klaviyo tracking.
 *
 * Consent is read from localStorage through useSyncExternalStore, so the SSR
 * HTML stays neutral and the banner only appears for undecided visitors after
 * hydration. Accepting injects the Klaviyo loader; declining persists a
 * refusal so no tracking script is ever loaded.
 */
export function CookieConsentBanner({ klaviyoPublicKey }: CookieConsentBannerProps) {
  const consent = useSyncExternalStore(
    subscribeMarketingConsent,
    getMarketingConsentSnapshot,
    getServerMarketingConsentSnapshot,
  );

  useEffect(() => {
    if (consent === "granted" && klaviyoPublicKey) {
      loadKlaviyoScript(klaviyoPublicKey);
    }
  }, [consent, klaviyoPublicKey]);

  if (consent !== "pending") {
    return null;
  }

  return (
    <section
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
