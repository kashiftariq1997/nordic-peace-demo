import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

export type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-plum text-cream hover:bg-rose-ink",
  secondary:
    "border border-plum text-plum hover:border-rose-ink hover:text-rose-ink bg-transparent",
  ghost: "text-plum hover:text-rose-ink bg-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  // Tap targets stay >= 44px in both sizes.
  sm: "h-11 px-5 text-sm",
  md: "h-12 px-7 text-sm",
};

/**
 * Class string for button styling — use it to style links that act as buttons:
 * `<Link href={ROUTES.X} className={buttonClassName("primary")} />`.
 * Focus rings come from the global :focus-visible rule in globals.css.
 */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide",
    "transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClassName({ variant, size, className })} {...props} />
  );
}
