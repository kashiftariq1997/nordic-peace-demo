const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Loose client-side email check (format only, not deliverability). */
export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
