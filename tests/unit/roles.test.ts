import { describe, it, expect } from "vitest";
import { can, canDelete, homeFor, isTeam, PERMISSIONS } from "@/lib/roles";

describe("roles permission map", () => {
  it("lets staff read but not write the catalog", () => {
    expect(can("staff", "products", "read")).toBe(true);
    expect(can("staff", "products", "write")).toBe(false);
    expect(can("admin", "products", "write")).toBe(true);
  });

  it("blocks staff from the staff area and discount writes", () => {
    expect(can("staff", "staff", "read")).toBe(false);
    expect(can("staff", "discounts", "write")).toBe(false);
  });

  it("keeps customers out of every team area", () => {
    for (const area of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
      if (area === "portal") continue;
      expect(can("customer", area, "read")).toBe(false);
    }
    expect(can("customer", "portal", "read")).toBe(true);
  });

  it("denies a missing role", () => {
    expect(can(null, "dashboard", "read")).toBe(false);
  });

  it("routes by role and limits delete to admin", () => {
    expect(homeFor("customer")).toBe("/portal");
    expect(homeFor("staff")).toBe("/dashboard");
    expect(isTeam("staff")).toBe(true);
    expect(canDelete("staff", "payments")).toBe(false);
    expect(canDelete("admin", "payments")).toBe(true);
  });
});
