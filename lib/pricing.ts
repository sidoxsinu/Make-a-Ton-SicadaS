/**
 * lib/pricing.ts
 * Pricing calculation helper for editor preview.
 * Source of truth is SQL (0003_billing.sql).
 * Pinned by tests to Golden Vectors V1 and V4.
 */

export interface PricingLineInput {
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  discount_amount?: number;
}

export interface PricingLineResult {
  gross: number;
  discount_amount: number;
  net: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

export interface PricingSummary {
  lines: PricingLineResult[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
}

/**
 * Rounds a number half up to 2 decimal places (standard financial rounding)
 */
export function roundHalfUp(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateLine(input: PricingLineInput): PricingLineResult {
  const quantity = Math.max(0, input.quantity || 0);
  const unit_price = Math.max(0, input.unit_price || 0);
  const tax_rate = Math.max(0, input.tax_rate || 0);
  const discount_amount = Math.min(
    roundHalfUp(quantity * unit_price),
    Math.max(0, input.discount_amount || 0)
  );

  const gross = roundHalfUp(quantity * unit_price, 2);
  const net = roundHalfUp(gross - discount_amount, 2);
  const tax_amount = roundHalfUp((net * tax_rate) / 100, 2);
  const line_total = roundHalfUp(net + tax_amount, 2);

  return {
    gross,
    discount_amount,
    net,
    tax_rate,
    tax_amount,
    line_total,
  };
}

export function calculateTotals(lines: PricingLineInput[]): PricingSummary {
  const calculatedLines = lines.map(calculateLine);

  const subtotal = roundHalfUp(
    calculatedLines.reduce((acc, l) => acc + l.gross, 0),
    2
  );
  const discount_total = roundHalfUp(
    calculatedLines.reduce((acc, l) => acc + l.discount_amount, 0),
    2
  );
  const tax_total = roundHalfUp(
    calculatedLines.reduce((acc, l) => acc + l.tax_amount, 0),
    2
  );
  const total = roundHalfUp(
    calculatedLines.reduce((acc, l) => acc + l.line_total, 0),
    2
  );

  return {
    lines: calculatedLines,
    subtotal,
    discount_total,
    tax_total,
    total,
  };
}

