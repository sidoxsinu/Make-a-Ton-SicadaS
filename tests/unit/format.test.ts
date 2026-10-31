import { describe, it, expect } from "vitest";
import { formatValue, formatCompact } from "@/lib/format";

describe("format", () => {
  it("formats money in en-IN", () => {
    expect(formatValue(18408, "money")).toBe("\u20B918,408.00");
  });
  it("formats percent without trailing zeros", () => {
    expect(formatValue(18, "percent")).toBe("18%");
    expect(formatValue(4.5, "percent")).toBe("4.5%");
  });
  it("formats whole numbers with grouping", () => {
    expect(formatValue(10240, "number")).toBe("10,240");
  });
  it("compacts money for chart labels", () => {
    expect(formatCompact(150000, "money")).toContain("1.5");
  });
});
