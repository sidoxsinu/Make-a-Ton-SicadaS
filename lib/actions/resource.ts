"use server";

import { getSession } from "@/lib/data/session";
import { getResource } from "@/lib/resources";
import type { ActionResult } from "./types";

const DENIED = "You do not have access to this.";

async function authorise(name: string) {
  const resource = getResource(name);
  if (!resource) return { error: "This form is not available. Reload the page." } as const;
  const session = await getSession();
  if (!session || !resource.permissions.write.includes(session.role)) {
    return { error: DENIED } as const;
  }
  return { resource } as const;
}

// STUBS. Validation and permission checks are real. Persistence is not wired,
// so a valid call returns ok without writing. Replace the marked lines with
// the data layer call when the backend is ready.
export async function createResource(
  name: string,
  values: Record<string, unknown>
): Promise<ActionResult> {
  const auth = await authorise(name);
  if ("error" in auth) return { ok: false, message: auth.error };

  const parsed = auth.resource.schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Fix the highlighted fields.", fieldErrors };
  }

  // Persistence call goes here.
  return { ok: true, message: "Saved." };
}

export async function updateResource(
  name: string,
  id: string,
  values: Record<string, unknown>
): Promise<ActionResult> {
  if (!id) return { ok: false, message: "Reload the page and try again." };
  return createResource(name, values);
}

export async function removeResource(
  name: string,
  id: string
): Promise<ActionResult> {
  const auth = await authorise(name);
  if ("error" in auth) return { ok: false, message: auth.error };
  if (!id) return { ok: false, message: "Reload the page and try again." };

  // Persistence call goes here. A foreign key failure must return
  // "This record is in use. Deactivate it instead."
  return { ok: true, message: "Removed." };
}
