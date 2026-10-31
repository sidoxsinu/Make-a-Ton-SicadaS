import React from "react";

const baseInputClasses =
  "w-full h-[36px] px-2.5 bg-sheet text-ink border border-rule-strong rounded-sm text-[14px] font-sans focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        className={`${baseInputClasses} ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="number"
        className={`${baseInputClasses} font-mono text-[13px] tabular-nums text-right ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="date"
        className={`${baseInputClasses} font-mono text-[13px] ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
DateInput.displayName = "DateInput";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = "", hasError, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full p-2.5 bg-sheet text-ink border border-rule-strong rounded-sm text-[14px] font-sans focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
TextArea.displayName = "TextArea";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, className = "", hasError, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`${baseInputClasses} cursor-pointer ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  name,
}: ToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-2 select-none cursor-pointer text-[14px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`inline-flex items-center justify-center h-[24px] px-2 text-[12px] font-mono border rounded-sm ${
          checked
            ? "bg-accent text-accent-ink border-accent font-semibold"
            : "bg-sheet text-ink-2 border-rule-strong"
        }`}
      >
        {checked ? "YES" : "NO"}
      </span>
      {label && <span className="font-sans text-ink">{label}</span>}
    </label>
  );
}

