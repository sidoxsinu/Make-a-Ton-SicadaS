import React from "react";
import Link from "next/link";

export interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function ErrorState({
  message,
  actionLabel = "Reload",
  actionHref,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`py-6 px-4 border border-bad rounded-sm bg-sheet flex flex-col gap-2 ${className}`}
    >
      <p className="text-[14px] font-sans text-bad">{message}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="text-[13px] font-sans text-ink underline decoration-1 underline-offset-2 hover:text-ink-2 w-fit"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
