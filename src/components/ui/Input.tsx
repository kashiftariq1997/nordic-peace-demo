import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Marks the field invalid (adds an accessible error border + aria-invalid). */
  invalid?: boolean;
};

export function Input({ className, type = "text", invalid = false, ...props }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "text-plum h-12 w-full rounded-full border bg-white px-5 text-sm",
        "placeholder:text-plum-soft",
        "transition-colors duration-200",
        invalid ? "border-rose-ink" : "border-line hover:border-blush-deep",
        className,
      )}
      {...props}
    />
  );
}
