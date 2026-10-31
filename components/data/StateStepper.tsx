"use client";

import React, { useRef } from "react";
import { useStepperFill } from "@/lib/motion";

export interface StateStepperProps {
  steps: string[];
  current: string;
  badgeOverlay?: string;
  className?: string;
}

export function StateStepper({
  steps,
  current,
  badgeOverlay,
  className = "",
}: StateStepperProps) {
  const currentIndex = steps.findIndex(
    (s) => s.toLowerCase() === current.toLowerCase()
  );
  const activeRef = useRef<HTMLDivElement>(null);
  useStepperFill(activeRef, currentIndex);

  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      {steps.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        let styleClasses = "border border-rule-strong text-ink-2 bg-transparent";
        if (isPast) {
          styleClasses = "border-ink bg-ink text-paper font-medium";
        } else if (isCurrent) {
          styleClasses = "border-accent bg-accent text-accent-ink font-semibold";
        }

        return (
          <div
            key={step}
            ref={isCurrent ? activeRef : undefined}
            className={`h-[28px] px-3 flex items-center justify-center text-[11px] font-sans uppercase tracking-[0.04em] rounded-sm transition-colors ${styleClasses}`}
          >
            <span>{step}</span>
            {isCurrent && badgeOverlay && (
              <span className="ml-1.5 font-mono text-[10px] text-warn font-normal">
                ({badgeOverlay})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
