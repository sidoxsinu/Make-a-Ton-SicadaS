import { formatMoney } from "@/components/ui/Money";

export type ValueFormat = "money" | "number" | "percent";

function trimNumber(value: number, digits: number): string {
  return String(Number(value.toFixed(digits)));
}

// Full value, used for KPI values and screen reader text.
export function formatValue(
  value: number,
  format: ValueFormat,
  currency: string = "INR"
): string {
  switch (format) {
    case "money":
      return formatMoney(value, currency);
    case "percent":
      return `${trimNumber(value, 2)}%`;
    default:
      return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(Math.round(value));
  }
}

// Short value, used for chart axis and bar labels.
export function formatCompact(
  value: number,
  format: ValueFormat,
  currency: string = "INR"
): string {
  try {
    if (format === "money") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
    if (format === "percent") {
      return `${trimNumber(value, 1)}%`;
    }
    return new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return formatValue(value, format, currency);
  }
}
