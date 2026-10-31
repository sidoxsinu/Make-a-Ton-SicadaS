"use client";

import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  loading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      disabled = false,
      href,
      children,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-sans text-[14px] leading-none transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

    let variantClasses = "";
    if (disabled || loading) {
      variantClasses =
        "h-[36px] px-3.5 border border-rule text-ink-2 bg-transparent cursor-not-allowed";
    } else {
      switch (variant) {
        case "primary":
          variantClasses =
            "h-[36px] px-3.5 bg-accent text-accent-ink font-semibold rounded-sm hover:opacity-90 active:opacity-95";
          break;
        case "secondary":
          variantClasses =
            "h-[36px] px-3.5 border border-ink text-ink bg-transparent font-normal rounded-sm hover:bg-hover active:bg-selected";
          break;
        case "quiet":
          variantClasses =
            "p-0 h-auto text-ink underline decoration-1 underline-offset-2 bg-transparent hover:text-ink-2";
          break;
        case "danger":
          variantClasses =
            "h-[36px] px-3.5 border border-bad text-bad bg-transparent font-normal rounded-sm hover:bg-sheet active:opacity-90";
          break;
      }
    }

    const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

    if (href && !disabled && !loading) {
      return (
        <Link href={href} className={combinedClasses}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={combinedClasses}
        {...props}
      >
        {loading ? (
          <span className="font-mono text-[13px]">{children} (loading...)</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

