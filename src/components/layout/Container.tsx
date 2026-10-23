import type { ComponentProps } from "react";
import { cn } from "@/utils";

export type ContainerProps = ComponentProps<"div">;

/** Centered page wrapper — max-w-6xl with consistent horizontal padding. */
export function Container({ className, ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}
