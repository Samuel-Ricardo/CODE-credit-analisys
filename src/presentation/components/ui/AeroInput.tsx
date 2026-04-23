import { clsx } from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface AeroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

interface AeroTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

interface AeroSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function AeroInput({
  label,
  error,
  hint,
  leftIcon,
  className,
  id,
  ...props
}: AeroInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1a1a2e]/80">
          {label}
          {props.required && <span className="text-orange-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            "input-aero w-full px-3 py-2.5 text-sm",
            leftIcon && "pl-9",
            error && "border-red-400/60 focus:border-red-400",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted/60">{hint}</p>}
    </div>
  );
}

export function AeroTextarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: AeroTextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text/80">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          "input-aero w-full px-3 py-2.5 text-sm resize-y min-h-20",
          error && "border-red-400/60",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted/60">{hint}</p>}
    </div>
  );
}

export function AeroSelect({
  label,
  error,
  options,
  className,
  id,
  ...props
}: AeroSelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text/80">
          {label}
          {props.required && <span className="text-orange-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          "input-aero w-full px-3 py-2.5 text-sm appearance-none cursor-pointer",
          error && "border-red-400/60",
          className,
        )}
        {...props}
      >
        <option value="">Selecione...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
