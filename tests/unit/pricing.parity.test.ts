import { describe, it, expect } from "vitest";
import { calculateTotals } from "@/lib/pricing";

describe("Pricing Parity Tests (Golden Vectors V1, V4)", () => {
  it("Vector V1: One line, qty 10, unit 1560, tax 18% -> gross 15600, tax 2808, total 18408", () => {
    const summary = calculateTotals([
      {
        quantity: 10,
        unit_price: 1560.0,
        tax_rate: 18.0,
      },
    ]);

    expect(summary.lines[0].gross).toBe(15600.0);
    expect(summary.lines[0].discount_amount).toBe(0.0);
    expect(summary.lines[0].net).toBe(15600.0);
    expect(summary.lines[0].tax_amount).toBe(2808.0);
    expect(summary.lines[0].line_total).toBe(18408.0);

    expect(summary.subtotal).toBe(15600.0);
    expect(summary.tax_total).toBe(2808.0);
    expect(summary.total).toBe(18408.0);
  });

  it("Vector V4: One line, qty 3, unit 33.33, tax 5% -> gross 99.99, tax 5.00, total 104.99", () => {
    const summary = calculateTotals([
      {
        quantity: 3,
        unit_price: 33.33,
        tax_rate: 5.0,
      },
    ]);

    expect(summary.lines[0].gross).toBe(99.99);
    // 99.99 * 5 / 100 = 4.9995 -> rounds half up to 5.00
    expect(summary.lines[0].tax_amount).toBe(5.0);
    expect(summary.lines[0].line_total).toBe(104.99);

    expect(summary.subtotal).toBe(99.99);
    expect(summary.tax_total).toBe(5.0);
    expect(summary.total).toBe(104.99);
  });
});

