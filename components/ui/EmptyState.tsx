import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  message,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`py-12 px-4 flex flex-col items-center justify-center text-center gap-4 ${className}`}
    >
      <p className="text-[14px] font-sans text-ink-2 max-w-[480px]">
        {message}
      </p>
      {actionLabel && (actionHref || onAction) && (
        <Button
          variant="primary"
          href={actionHref}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

