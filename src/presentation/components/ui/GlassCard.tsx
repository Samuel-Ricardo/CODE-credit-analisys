import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "orange";
  padding?: "sm" | "md" | "lg" | "none";
  rounded?: "md" | "lg" | "xl";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const roundedMap = {
  md: "rounded-2xl",
  lg: "rounded-3xl",
  xl: "rounded-[28px]",
};

const variantMap = {
  default: "glass",
  dark: "glass-dark",
  orange: "",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  padding = "md",
  rounded = "lg",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        variantMap[variant],
        paddingMap[padding],
        roundedMap[rounded],
        variant === "orange" && [
          "bg-linear-to-br from-orange-500/20 to-orange-700/10",
          "backdrop-blur-xl border border-orange-300/40",
          "shadow-[0_8px_32px_rgba(245,124,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)]",
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}