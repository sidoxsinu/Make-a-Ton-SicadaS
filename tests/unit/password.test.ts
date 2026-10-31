import { describe, it, expect } from "vitest";
import { passwordSchema, checkPasswordRules } from "@/lib/schema/password";

describe("Password Rules Acceptance (AC-AUTH-2)", () => {
  it("Abcdefg1! passes with 9 characters and all classes", () => {
    const res = passwordSchema.safeParse("Abcdefg1!");
    expect(res.success).toBe(true);
    const rules = checkPasswordRules("Abcdefg1!");
    expect(rules.length).toBe(true);
    expect(rules.uppercase).toBe(true);
    expect(rules.lowercase).toBe(true);
    expect(rules.special).toBe(true);
  });

  it("Abcdefg! fails due to 8 characters", () => {
    const res = passwordSchema.safeParse("Abcdefg!");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("Use at least 9 characters");
    }
  });

  it("abcdefgh1! fails due to no uppercase", () => {
    const res = passwordSchema.safeParse("abcdefgh1!");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("Add an uppercase letter");
    }
  });

  it("ABCDEFGH1! fails due to no lowercase", () => {
    const res = passwordSchema.safeParse("ABCDEFGH1!");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("Add a lowercase letter");
    }
  });

  it("Abcdefgh12 fails due to no special character", () => {
    const res = passwordSchema.safeParse("Abcdefgh12");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toBe("Add a special character");
    }
  });
});

