import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas inline-flex items-center justify-center rounded-none px-9 py-4 text-sm font-black uppercase tracking-wide transition-[filter,background-color]",
        variant === "primary" ? "bg-white text-ink hover:brightness-90" : "bg-surface-soft text-text-primary hover:bg-surface",
        className,
      )}
      {...props}
    />
  );
});
