"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const requestedRole = ((formData.get("role") as string) || "customer").trim().toLowerCase();
  const validRole: UserRole =
    requestedRole === "admin" || requestedRole === "staff" ? (requestedRole as UserRole) : "customer";

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: raw.email,
    password: raw.password,
    options: {
      data: {
        full_name: raw.fullName,
        role: validRole,
      },
    },
  });

  if (error) {
    let message = error.message;
    if (message.toLowerCase().includes("password should contain")) {
      message = "Password must contain at least 9 characters including uppercase, lowercase, numbers (0-9), and special characters.";
    }
    return {
      ok: false,
      message,
    };
  }

  // If role is admin or staff, ensure profile and app_metadata are elevated via service role
  if (data?.user) {
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
        app_metadata: { role: validRole },
      });
      await adminClient.from("profiles").upsert({
        id: data.user.id,
        full_name: raw.fullName,
        role: validRole,
      });
    } catch (e) {
      console.warn("Could not elevate new user role:", e);
    }
  }

  const dest = getRedirectForRole(validRole);

  // If session created immediately (auto-confirm)
  if (data?.session) {
    redirect(dest);
  }

  // Attempt instant sign-in since email was confirmed above
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: raw.email,
    password: raw.password,
  });

  if (signInData?.session) {
    redirect(dest);
  }

  return {
    ok: true,
    message: "Account created successfully! You can now sign in.",
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
      pass: "Brightloop1!",
      dest: "/dashboard",
    },
    staff: {
      email: "staff@brightloop.local",
      pass: "Brightloop1!",
      dest: "/dashboard",
    },
    customer: {
      email: "demo.customer@brightloop.com",
      pass: "Customer1!",
      dest: "/portal",
    },
  };

  const account = accounts[role];
  if (!account) {
    throw new Error("Invalid demo role requested.");
  }

  const supabase = createClient();
  let { data, error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.pass,
  });

  if (error || !data.user) {
    // Self-healing fallback: ensure demo user exists and credentials match
    try {
      const adminClient = createAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const existing = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === account.email.toLowerCase()
      );
      if (existing) {
        await adminClient.auth.admin.updateUserById(existing.id, {
          password: account.pass,
          email_confirm: true,
        });
      } else {
        const { data: created } = await adminClient.auth.admin.createUser({
          email: account.email,
          password: account.pass,
          email_confirm: true,
          user_metadata: {
            role,
            full_name: role === "customer" ? "Demo Customer" : `Demo ${role}`,
          },
        });
        if (created?.user) {
          await adminClient.from("profiles").upsert(
            {
              id: created.user.id,
              full_name:
                role === "customer" ? "Demo Customer" : `Demo ${role}`,
              role,
            },
            { onConflict: "id" }
          );
        }
      }

      // Retry sign-in
      const retry = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.pass,
      });
      data = retry.data;
      error = retry.error;
    } catch {
      // Continue to final check
    }
  }

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
    let message = error.message;
    if (message.toLowerCase().includes("password should contain")) {
      message = "Password must contain at least 9 characters including uppercase, lowercase, numbers (0-9), and special characters.";
    }
    return {
      ok: false,
      message,
    };
  }

  redirect("/login");
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

