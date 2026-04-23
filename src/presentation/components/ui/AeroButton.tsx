import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface AeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const sizeMap = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

export function AeroButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: AeroButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer select-none transition-all duration-150",
        sizeMap[size],
        variant === "primary" && "btn-aero shine-hover",
        variant === "ghost" && "btn-ghost",
        variant === "danger" && [
          "bg-linear-to-b from-red-400 to-red-600",
          "text-white rounded-md shadow-[0_4px_16px_rgba(239,83,80,0.4),inset_0_1px_0_rgba(255,180,180,0.4)]",
          "hover:-translate-y-px active:translate-y-0",
        ],
        (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
