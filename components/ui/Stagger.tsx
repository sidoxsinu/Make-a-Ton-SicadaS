"use client";

import React, { useRef } from "react";
import { useStagger } from "@/lib/motion";

export interface StaggerRowsProps {
  children: React.ReactNode;
  // Changes when new data arrives, so the first rows animate again.
  triggerKey: string;
  className?: string;
}

// Wraps a table. Rows are already in the DOM before the stagger starts.
export function StaggerRows({ children, triggerKey, className = "" }: StaggerRowsProps) {
  const ref = useRef<HTMLDivElement>(null);
  useStagger(ref, "tbody tr", [triggerKey]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
