import React from "react";

export interface LoadingStateProps {
  label: string;
  rows?: number;
  className?: string;
}

// Static ruled placeholder. No animation, so it also respects reduced motion.
export function LoadingState({ label, rows = 6, className = "" }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <p className="py-2 text-[13px] font-sans text-ink-2">{`Loading ${label}`}</p>
      <div aria-hidden="true" className="border-t border-ink">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-[36px] border-b border-rule" />
        ))}
      </div>
    </div>
  );
}
