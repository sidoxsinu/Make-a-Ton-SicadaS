import "server-only";
import { ROLES, type Role } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError?.name === "AuthSessionMissingError") return null;
  if (authError) throw new Error(authError.message);
  if (!authData.user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", authData.user.id)
    .single();
  if (error) throw new Error(error.message);
  if (!ROLES.includes(profile.role as Role)) {
    throw new Error("The signed-in user's profile has an unsupported role.");
  }

  return {
    userId: authData.user.id,
    email: authData.user.email ?? "",
    fullName: profile.full_name,
    role: profile.role as Role,
  };
}
