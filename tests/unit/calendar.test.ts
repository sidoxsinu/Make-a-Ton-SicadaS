import { describe, it, expect } from "vitest";
import {
  parseIsoDate,
  toIsoDate,
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  formatCalendarHeader,
  isDateOutOfRange,
} from "@/components/ui/Calendar";

describe("Calendar date utilities", () => {
  it("parses valid ISO dates accurately without UTC drift", () => {
    expect(parseIsoDate("2026-10-31")).toEqual({
      year: 2026,
      month: 9,
      day: 31,
    });
    expect(parseIsoDate("2024-02-29")).toEqual({
      year: 2024,
      month: 1,
      day: 29,
    });
  });

  it("rejects invalid ISO dates and non-leap Feb 29", () => {
    expect(parseIsoDate("2023-02-29")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate("2026-04-31")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
  });

  it("formats ISO dates with zero-padded month and day", () => {
    expect(toIsoDate(2026, 9, 31)).toBe("2026-10-31");
    expect(toIsoDate(2023, 2, 5)).toBe("2023-03-05");
  });

  it("computes days in month and first weekday accurately", () => {
    expect(getDaysInMonth(2026, 9)).toBe(31); // October 2026
    expect(getFirstWeekdayOfMonth(2026, 9)).toBe(4); // Oct 1, 2026 is Thursday
  });

  it("formats calendar header as 'D MMM, YY' + Weekday when viewing active month", () => {
    const selected = { year: 2026, month: 9, day: 31 };
    const today = { year: 2026, month: 9, day: 31 };
    expect(formatCalendarHeader(selected, 2026, 9, today)).toEqual({
      primary: "31 Oct, 26",
      secondary: "Saturday",
    });
  });

  it("formats calendar header as 'Month YYYY' when browsing an unselected month", () => {
    const selected = { year: 2026, month: 9, day: 31 };
    const today = { year: 2026, month: 9, day: 31 };
    expect(formatCalendarHeader(selected, 2026, 10, today)).toEqual({
      primary: "November",
      secondary: "2026",
    });
  });

  it("checks min and max bounds", () => {
    expect(isDateOutOfRange("2026-10-10", "2026-10-15", "2026-10-25")).toBe(true);
    expect(isDateOutOfRange("2026-10-20", "2026-10-15", "2026-10-25")).toBe(false);
    expect(isDateOutOfRange("2026-10-30", "2026-10-15", "2026-10-25")).toBe(true);
  });
});

