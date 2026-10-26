"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { isEmail } from "@/utils";

type FormStatus = "idle" | "loading" | "success" | "error";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const TEXTAREA_CLASSES = {
  base: "text-plum w-full rounded-3xl border bg-white px-5 py-4 text-sm transition-colors duration-200 placeholder:text-plum-soft/70",
  invalid: "border-rose-ink",
  valid: "border-line hover:border-blush-deep",
} as const;

/**
 * Contact form (posts to /api/contact — the endpoint arrives in Phase 6;
 * until then the API responds 404 and the error state shows, same as the
 * newsletter signup). Client-side validation keeps the demo fully usable.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Please tell us your name.";
    if (!isEmail(email)) nextErrors.email = "Please enter a valid email address.";
    if (message.trim().length < 10) {
      nextErrors.message = "Please add a little more detail (10 characters minimum).";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(`Contact submission failed with status ${response.status}`);
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
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
        Thank you — your note is with us and we&apos;ll reply within two business days. (Demo:
        nothing is actually sent yet.)
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="contact-name" className="sr-only">
            Name
          </label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="contact-email" className="sr-only">
            Email address
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
          />
        </div>
      </div>

      {errors.name && (
        <p id="contact-name-error" className="text-rose-ink text-sm">
          {errors.name}
        </p>
      )}
      {errors.email && (
        <p id="contact-email-error" className="text-rose-ink text-sm">
          {errors.email}
        </p>
      )}

      <div>
        <label htmlFor="contact-message" className="sr-only">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="How can we help?"
          value={message}
          aria-invalid={Boolean(errors.message) || undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={
            errors.message
              ? `${TEXTAREA_CLASSES.base} ${TEXTAREA_CLASSES.invalid}`
              : `${TEXTAREA_CLASSES.base} ${TEXTAREA_CLASSES.valid}`
          }
          onChange={(event) => {
            setMessage(event.target.value);
            clearError("message");
          }}
        />
      </div>

      {errors.message && (
        <p id="contact-message-error" className="text-rose-ink text-sm">
          {errors.message}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"} className="self-start">
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>

      <p aria-live="polite" className="sr-only">
        {status === "error" ? "Something went wrong. Please try again." : ""}
      </p>

      {status === "error" && (
        <p className="text-rose-ink text-sm" role="alert">
          Something went wrong. Please try again, or email us directly.
        </p>
      )}
    </form>
  );
}
