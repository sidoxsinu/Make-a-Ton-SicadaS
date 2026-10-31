import { describe, it, expect } from "vitest";

// Token values from styles/tokens.css
const TOKENS = {
  paper: "#EFEBE2",
  sheet: "#F7F4EC",
  hover: "#E7E2D6",
  selected: "#DCD6C6",
  ink: "#1B1F23",
  ink2: "#4B525A",
  rule: "#CBC4B4",
  ruleStrong: "#8C8676",
  accent: "#1E4D5C",
  accentInk: "#F7F4EC",
  ok: "#2D6A3E",
  warn: "#85560A",
  bad: "#9B2C25",
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [num >> 16, (num >> 8) & 0xff, num & 0xff];
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hex1: string, hex2: string) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Design System Token Contrast Checks (WCAG AA >= 4.5:1)", () => {
  it("primary text (ink on paper)", () => {
    const ratio = contrast(TOKENS.ink, TOKENS.paper);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("secondary text (ink2 on paper)", () => {
    const ratio = contrast(TOKENS.ink2, TOKENS.paper);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("accent button (accentInk on accent)", () => {
    const ratio = contrast(TOKENS.accentInk, TOKENS.accent);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("ok status (ok on sheet)", () => {
    const ratio = contrast(TOKENS.ok, TOKENS.sheet);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("warn status (warn on sheet)", () => {
    const ratio = contrast(TOKENS.warn, TOKENS.sheet);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("bad status (bad on sheet)", () => {
    const ratio = contrast(TOKENS.bad, TOKENS.sheet);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
