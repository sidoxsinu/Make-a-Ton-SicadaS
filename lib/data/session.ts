import "server-only";
import { ROLES, type Role } from "@/lib/roles";

export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

// TEST DATA. Mock session until Supabase auth is wired. Set MOCK_ROLE to admin,
// staff or customer to preview another role. Replace the body of this function
// with the real session lookup and keep the signature.
export async function getSession(): Promise<Session | null> {
  const requested = process.env.MOCK_ROLE;
  const role: Role = ROLES.find((r) => r === requested) ?? "admin";
  return {
    userId: `test-${role}`,
    email: `${role}@brightloop.test`,
    fullName: `Test ${role}`,
    role,
  };
}
