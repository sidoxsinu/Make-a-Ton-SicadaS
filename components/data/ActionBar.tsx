"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
}

export interface ActionBarProps {
  actions: ActionItem[];
  className?: string;
}

export function ActionBar({ actions, className = "" }: ActionBarProps) {
  const visibleActions = actions.filter((a) => a.visible !== false);

  if (visibleActions.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 bg-sheet border border-rule rounded-sm ${className}`}
    >
      {visibleActions.map((act) => (
        <Button
          key={act.label}
          variant={act.variant || "secondary"}
          onClick={act.onClick}
          disabled={act.disabled}
          loading={act.loading}
        >
          {act.label}
        </Button>
      ))}
    </div>
  );
}
