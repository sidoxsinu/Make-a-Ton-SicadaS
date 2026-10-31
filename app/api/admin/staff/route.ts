import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { passwordSchema } from "@/lib/schema/password";
import { z } from "zod";

const createStaffSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  temporaryPassword: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Only administrators can add staff members." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.temporaryPassword,
      email_confirm: true,
      app_metadata: { role: "staff" },
      user_metadata: { full_name: parsed.data.fullName },
    });

    if (createError) {
      return NextResponse.json(
        { ok: false, message: createError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { id: newUser.user?.id, email: newUser.user?.email },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
