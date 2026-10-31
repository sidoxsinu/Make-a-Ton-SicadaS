import React from "react";
import { checkPasswordRules } from "@/lib/schema/password";

export interface PasswordChecklistProps {
  password: string;
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  const rules = checkPasswordRules(password);

  const items = [
    { label: "At least 9 characters", met: rules.length },
    { label: "One uppercase letter", met: rules.uppercase },
    { label: "One lowercase letter", met: rules.lowercase },
    { label: "One number (0-9)", met: rules.number },
    { label: "One special character", met: rules.special },
  ];

  return (
    <div
      className="p-3 bg-sheet border border-rule rounded-sm flex flex-col gap-1.5 text-[12px] font-sans"
      aria-live="polite"
    >
      <span className="font-semibold text-ink-2 uppercase tracking-[0.04em] text-[11px]">
        Password Requirements:
      </span>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between select-none"
          >
            <span className={item.met ? "text-ink" : "text-ink-2"}>
              {item.label}
            </span>
            <span
              className={`font-mono text-[11px] uppercase font-semibold ${
                item.met ? "text-ok" : "text-ink-2"
              }`}
            >
              {item.met ? "Met" : "Not met"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
