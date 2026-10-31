"use client";

import React from "react";
import { Button } from "./Button";

export interface ActionBarAction {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "quiet" | "danger";
  visible: boolean;
}

export interface ActionBarProps {
  actions: ActionBarAction[];
  className?: string;
}

export function ActionBar({ actions, className = "" }: ActionBarProps) {
  const visible = actions.filter((a) => a.visible);
  if (visible.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Actions"
      className={`flex flex-wrap items-center gap-3 ${className}`}
    >
      {visible.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
