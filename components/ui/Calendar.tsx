"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type CalendarMarkerTone = "ok" | "accent" | "warn" | "bad" | "muted";

export interface CalendarMarker {
  date: string;
  tone?: CalendarMarkerTone;
  label?: string;
}

export interface ParsedDate {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  day: number;
}

export interface CalendarProps {
  value?: string | null;
  onChange?: (isoDate: string) => void;
  min?: string;
  max?: string;
  markers?: CalendarMarker[];
  className?: string;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const WEEKDAYS_SHORT = [
  { short: "Sun", full: "Sunday" },
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
] as const;

const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const TONE_FILL: Record<CalendarMarkerTone, string> = {
  ok: "var(--ok)",
  accent: "var(--accent)",
  warn: "var(--warn)",
  bad: "var(--bad)",
  muted: "var(--ink-2)",
};

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getFirstWeekdayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  const yyyy = String(year).padStart(4, "0");
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseIsoDate(value: string | null | undefined): ParsedDate | null {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (month < 0 || month > 11) return null;
  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) return null;

  return { year, month, day };
}

export function getTodayParts(now: Date = new Date()): ParsedDate {
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

export function formatCalendarHeader(
  selected: ParsedDate | null,
  viewYear: number,
  viewMonth: number,
  today: ParsedDate
): { primary: string; secondary: string } {
  const activeInView =
    selected && selected.year === viewYear && selected.month === viewMonth
      ? selected
      : !selected && today.year === viewYear && today.month === viewMonth
        ? today
        : null;

  if (activeInView) {
    const weekday =
      WEEKDAYS_FULL[
        new Date(activeInView.year, activeInView.month, activeInView.day).getDay()
      ];
    const yy = String(activeInView.year).slice(-2);
    return {
      primary: `${activeInView.day} ${MONTHS_SHORT[activeInView.month]}, ${yy}`,
      secondary: weekday,
    };
  }

  return {
    primary: MONTHS_FULL[viewMonth],
    secondary: String(viewYear),
  };
}

export function isDateOutOfRange(
  isoDate: string,
  min?: string,
  max?: string
): boolean {
  if (min && /^\d{4}-\d{2}-\d{2}$/.test(min) && isoDate < min) return true;
  if (max && /^\d{4}-\d{2}-\d{2}$/.test(max) && isoDate > max) return true;
  return false;
}

export function Calendar({
  value,
  onChange,
  min,
  max,
  markers = [],
  className = "",
}: CalendarProps) {
  const today = useMemo(() => getTodayParts(), []);
  const selected = useMemo(() => parseIsoDate(value), [value]);

  const initialAnchor = selected ?? today;
  const [viewYear, setViewYear] = useState<number>(initialAnchor.year);
  const [viewMonth, setViewMonth] = useState<number>(initialAnchor.month);
  const pendingFocusDayRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selected) {
      setViewYear(selected.year);
      setViewMonth(selected.month);
    }
  }, [selected]);

  useEffect(() => {
    if (pendingFocusDayRef.current !== null && gridRef.current) {
      const dayToFocus = pendingFocusDayRef.current;
      pendingFocusDayRef.current = null;
      const btn = gridRef.current.querySelector<HTMLButtonElement>(
        `button[data-day="${dayToFocus}"]`
      );
      btn?.focus();
    }
  }, [viewYear, viewMonth]);

  const markerMap = useMemo(() => {
    const map = new Map<string, CalendarMarker[]>();
    for (const m of markers) {
      if (!m.date) continue;
      const list = map.get(m.date) ?? [];
      list.push(m);
      map.set(m.date, list);
    }
    return map;
  }, [markers]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstWeekdayOfMonth(viewYear, viewMonth);
  const totalSlots = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const trailingBlankCount = totalSlots - firstWeekday - daysInMonth;

  const header = formatCalendarHeader(selected, viewYear, viewMonth, today);
  const todayIso = toIsoDate(today.year, today.month, today.day);
  const selectedIso = selected
    ? toIsoDate(selected.year, selected.month, selected.day)
    : null;

  const stepMonth = (delta: number, focusTargetDay?: "start" | "end" | number) => {
    const nextDate = new Date(viewYear, viewMonth + delta, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = nextDate.getMonth();
    const nextMaxDay = getDaysInMonth(nextYear, nextMonth);

    if (focusTargetDay !== undefined) {
      if (focusTargetDay === "start") {
        pendingFocusDayRef.current = 1;
      } else if (focusTargetDay === "end") {
        pendingFocusDayRef.current = nextMaxDay;
      } else {
        pendingFocusDayRef.current = Math.min(Math.max(1, focusTargetDay), nextMaxDay);
      }
    }

    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const moveFocusByDays = (currentDay: number, deltaDays: number) => {
    const target = new Date(viewYear, viewMonth, currentDay + deltaDays);
    const tYear = target.getFullYear();
    const tMonth = target.getMonth();
    const tDay = target.getDate();

    if (tYear === viewYear && tMonth === viewMonth) {
      const btn = gridRef.current?.querySelector<HTMLButtonElement>(
        `button[data-day="${tDay}"]`
      );
      btn?.focus();
    } else {
      pendingFocusDayRef.current = tDay;
      setViewYear(tYear);
      setViewMonth(tMonth);
    }
  };

  const handleDayKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    day: number
  ) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveFocusByDays(day, -1);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocusByDays(day, 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocusByDays(day, -7);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocusByDays(day, 7);
        break;
      case "Home":
        e.preventDefault();
        moveFocusByDays(day, -(day - 1));
        break;
      case "End":
        e.preventDefault();
        moveFocusByDays(day, daysInMonth - day);
        break;
      case "PageUp":
        e.preventDefault();
        stepMonth(-1, day);
        break;
      case "PageDown":
        e.preventDefault();
        stepMonth(1, day);
        break;
    }
  };

  const jumpToAnchorMonth = () => {
    const anchor = selected ?? today;
    setViewYear(anchor.year);
    setViewMonth(anchor.month);
  };

  return (
    <div
      className={`w-[304px] bg-sheet text-ink border border-rule-strong rounded-sm px-5 pt-4 pb-4 select-none ${className}`}
    >
      {/* Top Header: "10 Mar, 23 Wednesday" + "<  >" */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={jumpToAnchorMonth}
          className="inline-flex items-baseline text-left rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          title="Return to active month"
        >
          <span className="font-sans text-[15px] font-semibold text-ink tabular-nums tracking-[-0.01em]">
            {header.primary}
          </span>
          <span className="font-sans text-[15px] font-normal text-ink-2 ml-1.5">
            {header.secondary}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            aria-label="Previous month"
            className="w-7 h-7 inline-flex items-center justify-center rounded-sm text-ink-2 hover:text-ink hover:bg-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3.5L5.5 8L10 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => stepMonth(1)}
            aria-label="Next month"
            className="w-7 h-7 inline-flex items-center justify-center rounded-sm text-ink-2 hover:text-ink hover:bg-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 3.5L10.5 8L6 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Labels: Sun .. Sat */}
      <div className="grid grid-cols-7 mb-1.5" role="row">
        {WEEKDAYS_SHORT.map((wd) => (
          <div
            key={wd.short}
            role="columnheader"
            aria-label={wd.full}
            className="text-center font-sans text-[12px] font-normal text-ink-2 py-1"
          >
            {wd.short}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        ref={gridRef}
        role="grid"
        aria-label={`${MONTHS_FULL[viewMonth]} ${viewYear}`}
        className="grid grid-cols-7 gap-y-1"
      >
        {Array.from({ length: firstWeekday }).map((_, idx) => (
          <div key={`lead-${idx}`} aria-hidden="true" className="h-[38px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const iso = toIsoDate(viewYear, viewMonth, day);
          const isSelected = selectedIso === iso;
          const isToday = todayIso === iso;
          const isDisabled = isDateOutOfRange(iso, min, max);
          const dayMarkers = (markerMap.get(iso) ?? []).slice(0, 3);
          const weekdayName =
            WEEKDAYS_FULL[new Date(viewYear, viewMonth, day).getDay()];
          const markerSummary = dayMarkers
            .map((m) => m.label)
            .filter(Boolean)
            .join(", ");

          const dotPositions =
            dayMarkers.length === 1
              ? [18]
              : dayMarkers.length === 2
                ? [15.2, 20.8]
                : [13, 18, 23];

          return (
            <button
              key={iso}
              type="button"
              data-day={day}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${day} ${MONTHS_FULL[viewMonth]} ${viewYear}, ${weekdayName}${markerSummary ? `, ${markerSummary}` : ""}`}
              title={markerSummary || undefined}
              onClick={() => onChange?.(iso)}
              onKeyDown={(e) => handleDayKeyDown(e, day)}
              className="group relative flex items-center justify-center h-[38px] w-full rounded-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <span className="relative inline-flex items-center justify-center w-[36px] h-[36px]">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                >
                  {!isSelected && !isDisabled && (
                    <circle
                      cx="18"
                      cy="18"
                      r="16.5"
                      className="fill-transparent group-hover:fill-hover transition-colors"
                    />
                  )}

                  {isToday && !isSelected && (
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="var(--rule-strong)"
                      strokeWidth="1"
                    />
                  )}

                  {isSelected && (
                    <circle cx="18" cy="18" r="16.5" fill="var(--accent)" />
                  )}

                  {dayMarkers.map((marker, mIdx) => (
                    <circle
                      key={`${iso}-dot-${mIdx}`}
                      cx={dotPositions[mIdx]}
                      cy="29.5"
                      r={dayMarkers.length === 1 ? "2" : "1.75"}
                      fill={
                        isSelected
                          ? "var(--accent-ink)"
                          : TONE_FILL[marker.tone ?? "accent"]
                      }
                    />
                  ))}
                </svg>

                <span
                  className={`relative z-10 font-sans text-[13.5px] tabular-nums leading-none ${
                    isSelected
                      ? "text-accent-ink font-semibold"
                      : "text-ink font-medium"
                  }`}
                >
                  {day}
                </span>
              </span>
            </button>
          );
        })}

        {Array.from({ length: trailingBlankCount }).map((_, idx) => (
          <div key={`trail-${idx}`} aria-hidden="true" className="h-[38px]" />
        ))}
      </div>
    </div>
  );
}

