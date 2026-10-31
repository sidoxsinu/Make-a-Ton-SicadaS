import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(9, "Use at least 9 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

export interface PasswordRuleState {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  special: boolean;
}

export function checkPasswordRules(pwd: string): PasswordRuleState {
  return {
    length: pwd.length >= 9,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
}

