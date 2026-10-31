import React from "react";

export interface FieldProps {
  label: string;
  name?: string;
  error?: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  name,
  error,
  help,
  required,
  children,
  className = "",
}: FieldProps) {
  const errorId = name ? `${name}-error` : undefined;
  const helpId = name ? `${name}-help` : undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={name}
        className="text-[12px] font-sans font-medium text-ink-2"
      >
        {label}
        {required ? " *" : ""}
      </label>
      <div className="relative">{children}</div>
      {error && (
        <p id={errorId} className="text-[12px] font-sans text-bad">
          {error}
        </p>
      )}
      {!error && help && (
        <p id={helpId} className="text-[12px] font-sans text-ink-2">
          {help}
        </p>
      )}
    </div>
  );
}
