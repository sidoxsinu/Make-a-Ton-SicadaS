"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, CalendarMarker, parseIsoDate } from "./Calendar";
import { formatDate } from "./DateText";
import { usePopoverReveal } from "@/lib/motion";

const baseInputClasses =
  "w-full h-[36px] px-2.5 bg-sheet text-ink border border-rule-strong rounded-sm text-[14px] font-sans focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        className={`${baseInputClasses} ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="number"
        className={`${baseInputClasses} font-mono text-[13px] tabular-nums text-right ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

export interface DateInputProps extends InputProps {
  markers?: CalendarMarker[];
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className = "",
      hasError,
      markers,
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled,
      required,
      min,
      max,
      name,
      id,
      placeholder = "Select date",
      ...rest
    },
    forwardedRef
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(() =>
      typeof defaultValue === "string" ? defaultValue : ""
    );
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({
      top: 0,
      left: 0,
    });

    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);

    usePopoverReveal(popoverRef, open);

    useEffect(() => {
      setMounted(true);
    }, []);

    const currentValue = isControlled
      ? typeof value === "string"
        ? value
        : ""
      : internalValue;

    const updatePosition = useCallback(() => {
      const trigger = triggerRef.current;
      if (!trigger || typeof window === "undefined") return;

      const rect = trigger.getBoundingClientRect();
      const calendarWidth = 304;
      const estimatedHeight = 318;
      const margin = 8;

      let left = rect.left;
      if (left + calendarWidth > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - calendarWidth - margin);
      }

      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < estimatedHeight && rect.top > estimatedHeight
          ? rect.top - estimatedHeight - 4
          : rect.bottom + 4;

      setCoords({ top, left });
    }, []);

    useEffect(() => {
      if (!open) return;
      updatePosition();

      const handleViewportChange = () => updatePosition();
      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("scroll", handleViewportChange, true);

      // Focus active day button when calendar opens
      const frame = requestAnimationFrame(() => {
        const parsed = parseIsoDate(currentValue);
        const targetSelector = parsed
          ? `button[data-day="${parsed.day}"]`
          : 'button[aria-current="date"], button[data-day="1"]';
        const btn = popoverRef.current?.querySelector<HTMLButtonElement>(
          targetSelector
        );
        btn?.focus();
      });

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", handleViewportChange);
        window.removeEventListener("scroll", handleViewportChange, true);
      };
    }, [open, updatePosition, currentValue]);

    useEffect(() => {
      if (!open) return;

      const handlePointerDown = (e: MouseEvent) => {
        const target = e.target as Node | null;
        if (!target) return;
        if (
          triggerRef.current?.contains(target) ||
          popoverRef.current?.contains(target)
        ) {
          return;
        }
        setOpen(false);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    const emitValueChange = (nextIso: string) => {
      if (!isControlled) {
        setInternalValue(nextIso);
      }

      const inputEl = hiddenInputRef.current;
      if (inputEl) {
        inputEl.value = nextIso;
        onChange?.({
          target: inputEl,
          currentTarget: inputEl,
          type: "change",
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleSelectDate = (nextIso: string) => {
      emitValueChange(nextIso);
      setOpen(false);
      triggerRef.current?.focus();
    };

    const handleTriggerKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>
    ) => {
      if (disabled) return;
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (
        (e.key === "Backspace" || e.key === "Delete") &&
        !required &&
        currentValue
      ) {
        e.preventDefault();
        emitValueChange("");
      }
    };

    const formattedLabel = currentValue ? formatDate(currentValue) : "";
    const hasValidDate = Boolean(currentValue && formattedLabel !== "-");

    return (
      <div className="relative w-full">
        <input
          {...rest}
          ref={(node) => {
            hiddenInputRef.current = node;
            assignRef(forwardedRef, node);
          }}
          type="hidden"
          name={name}
          value={currentValue}
          disabled={disabled}
          required={required}
        />

        <button
          ref={triggerRef}
          id={id ?? name}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          onBlur={(e) => {
            if (
              popoverRef.current &&
              e.relatedTarget &&
              popoverRef.current.contains(e.relatedTarget as Node)
            ) {
              return;
            }
            if (hiddenInputRef.current && onBlur) {
              onBlur({
                ...e,
                target: hiddenInputRef.current,
                currentTarget: hiddenInputRef.current,
              } as unknown as React.FocusEvent<HTMLInputElement>);
            }
          }}
          className={`${baseInputClasses} flex items-center justify-between gap-2 text-left cursor-pointer ${open ? "border-accent" : ""
            } ${hasError ? "border-bad" : ""} ${className}`}
        >
          <span
            className={`font-mono text-[13px] tabular-nums truncate ${hasValidDate ? "text-ink" : "text-ink-2"
              }`}
          >
            {hasValidDate ? formattedLabel : placeholder}
          </span>

          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className={`shrink-0 transition-colors ${open ? "text-accent" : "text-ink-2"
              }`}
          >
            <rect
              x="2"
              y="3"
              width="12"
              height="11"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M2 6.5H14M5.25 1.75V4M10.75 1.75V4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {mounted &&
          open &&
          createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Choose date"
              style={{
                position: "fixed",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 70,
              }}
            >
              <Calendar
                value={currentValue}
                onChange={handleSelectDate}
                min={typeof min === "string" ? min : undefined}
                max={typeof max === "string" ? max : undefined}
                markers={markers}
              />
            </div>,
            document.body
          )}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = "", hasError, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full p-2.5 bg-sheet text-ink border border-rule-strong rounded-sm text-[14px] font-sans focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      />
    );
  }
);
TextArea.displayName = "TextArea";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, className = "", hasError, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`${baseInputClasses} cursor-pointer ${hasError ? "border-bad" : ""} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  name,
}: ToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-2 select-none cursor-pointer text-[14px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`inline-flex items-center justify-center h-[24px] px-2 text-[12px] font-mono border rounded-sm ${checked
            ? "bg-accent text-accent-ink border-accent font-semibold"
            : "bg-sheet text-ink-2 border-rule-strong"
          }`}
      >
        {checked ? "YES" : "NO"}
      </span>
      {label && <span className="font-sans text-ink">{label}</span>}
    </label>
  );
}
