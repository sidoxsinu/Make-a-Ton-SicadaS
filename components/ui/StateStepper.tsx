"use client";

import React, { useRef } from "react";
import { useStepperFill } from "@/lib/motion";

export interface StateStepperProps {
  steps: string[];
  current: string;
  className?: string;
}

export function StateStepper({ steps, current, className = "" }: StateStepperProps) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const currentIndex = steps.findIndex(
    (s) => s.toLowerCase() === current.toLowerCase()
  );
  useStepperFill(fillRef, currentIndex);

  return (
    <ol className={`flex flex-wrap ${className}`} aria-label="Status">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isPast = currentIndex >= 0 && i < currentIndex;

        const boxClass = isCurrent
          ? "border-accent text-accent-ink"
          : isPast
          ? "bg-ink border-ink text-paper"
          : "border-rule-strong text-ink-2";

        const position = isCurrent ? "Current" : isPast ? "Done" : "Upcoming";

        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className={`relative flex-1 min-w-[96px] h-[36px] flex items-center justify-center border -ml-px first:ml-0 px-3 text-[12px] font-sans font-semibold overflow-hidden ${boxClass}`}
          >
            {isCurrent && (
              <span
                ref={fillRef}
                aria-hidden="true"
                className="absolute inset-0 bg-accent"
              />
            )}
            <span className="relative">{step}</span>
            <span className="sr-only">{`, ${position}`}</span>
          </li>
        );
      })}
    </ol>
  );
}
