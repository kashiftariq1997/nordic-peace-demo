"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/constants";
import { isEmail, rememberKlaviyoEmail } from "@/utils";

type FormStatus = "idle" | "loading" | "success" | "error";

type NewsletterFormProps = {
  /** UTM-friendly signup source — "footer", "popup" or "home". */
  source: string;
};

/**
 * Newsletter signup — posts to /api/newsletter, which subscribes the address
 * through Klaviyo when keys are configured and answers `devMode` when they
 * aren't (the success copy then says so honestly). Consent is explicit and
 * required, both client- and server-side.
 */
export function NewsletterForm({ source }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [devMode, setDevMode] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validEmail = isEmail(email);
    setEmailError(validEmail ? null : "Please enter a valid email address.");
    setConsentError(consent ? null : "Please confirm you'd like to receive emails.");
    if (!validEmail || !consent) {
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent, source }),
      });
      if (!response.ok) {
        throw new Error(`Newsletter signup failed with status ${response.status}`);
      }
      const data = (await response.json()) as { devMode?: boolean };
      rememberKlaviyoEmail(email.trim());
      setDevMode(data.devMode === true);
      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p
        className="border-line bg-cream text-plum rounded-3xl border px-5 py-4 text-sm"
        role="status"
      >
        You&apos;re on the list — welcome.
        {devMode ? " (Demo mode: no emails are actually sent yet.)" : ""}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`newsletter-email-${source}`} className="sr-only">
            Email address
          </label>
          <Input
            id={`newsletter-email-${source}`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            invalid={Boolean(emailError)}
            aria-describedby={emailError ? `newsletter-email-error-${source}` : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) {
                setEmailError(null);
              }
            }}
          />
        </div>
        <Button type="submit" disabled={status === "loading"} className="shrink-0">
          {status === "loading" ? "Joining…" : "Join the list"}
        </Button>
      </div>

      {emailError && (
        <p id={`newsletter-email-error-${source}`} className="text-rose-ink text-sm">
          {emailError}
        </p>
      )}

      <label className="text-plum-soft flex cursor-pointer items-start gap-3 text-xs leading-5">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          aria-describedby={consentError ? `newsletter-consent-error-${source}` : undefined}
          className="accent-rose-ink mt-0.5 h-4 w-4 shrink-0"
          onChange={(event) => {
            setConsent(event.target.checked);
            if (consentError) {
              setConsentError(null);
            }
          }}
        />
        <span>
          I agree to receive email updates from Nordic Peace. Unsubscribe anytime — see our{" "}
          <Link
            href={ROUTES.policy("privacy")}
            className="hover:text-rose-ink underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {consentError && (
        <p id={`newsletter-consent-error-${source}`} className="text-rose-ink text-sm">
          {consentError}
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {status === "error" ? "Something went wrong. Please try again." : ""}
      </p>

      {status === "error" && (
        <p className="text-rose-ink text-sm" role="alert">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
