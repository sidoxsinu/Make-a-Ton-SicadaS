"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { passwordSchema } from "@/lib/schema/password";
import { getRedirectForRole, type UserRole } from "@/lib/roles";

export interface ActionResult<T = unknown> {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export async function signUpAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    fullName: (formData.get("fullName") as string) || "",
    email: ((formData.get("email") as string) || "").trim().toLowerCase(),
    password: (formData.get("password") as string) || "",
    confirmPassword: (formData.get("confirmPassword") as string) || "",
  };

  const parseResult = signUpSchema.safeParse(raw);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      message: "Please fix the errors in the form.",
      fieldErrors,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: raw.email,
    password: raw.password,
    options: {
      data: {
        full_name: raw.fullName,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  // If session created immediately (auto-confirm)
  if (data?.session) {
    redirect("/portal");
  }

  return {
    ok: true,
    message:
      "Check your inbox to confirm. If you already have an account, sign in or reset your password.",
  };
}

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function signInAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: ((formData.get("email") as string) || "").trim().toLowerCase(),
    password: (formData.get("password") as string) || "",
  };

  const parseResult = signInSchema.safeParse(raw);
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Invalid email or password.",
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: raw.email,
    password: raw.password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      message: "Invalid email or password.",
    };
  }

  // Fetch role
  let role: UserRole = "customer";
  const appRole = data.user.app_metadata?.role as UserRole | undefined;

  if (appRole) {
    role = appRole;
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role) {
      role = profile.role as UserRole;
    }
  }

  const target = getRedirectForRole(role);
  redirect(target);
}

export async function demoSignInAction(
  role: "admin" | "staff" | "customer"
): Promise<void> {
  const accounts: Record<
    "admin" | "staff" | "customer",
    { email: string; pass: string; dest: string }
  > = {
    admin: {
      email: "sinan@brightloop.local",
      pass: "password123",
      dest: "/dashboard",
    },
    staff: {
      email: "staff@brightloop.local",
      pass: "password123",
      dest: "/dashboard",
    },
    customer: {
      email: "demo.customer@brightloop.com",
      pass: "password123",
      dest: "/portal",
    },
  };

  const account = accounts[role];
  if (!account) {
    throw new Error("Invalid demo role requested.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.pass,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Failed to sign in demo persona.");
  }

  redirect(account.dest);
}

const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export async function requestResetAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();

  const parseResult = resetRequestSchema.safeParse({ email });
  if (!parseResult.success) {
    return {
      ok: false,
      message: "Enter a valid email address.",
    };
  }

  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  return {
    ok: true,
    message:
      "If an account exists for this email, a password reset link has been sent to your inbox.",
  };
}

const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export async function setNewPasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    password: (formData.get("password") as string) || "",
    confirmPassword: (formData.get("confirmPassword") as string) || "",
  };

  const parseResult = newPasswordSchema.safeParse(raw);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: raw.password,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  redirect("/login");
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

