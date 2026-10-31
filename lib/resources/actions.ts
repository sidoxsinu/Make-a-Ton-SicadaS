"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResourceActionResult<T = unknown> {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

export async function createResourceAction(
  table: string,
  revalidateUrl: string,
  data: Record<string, unknown>
): Promise<ResourceActionResult> {
  const supabase = createClient();

  const { data: inserted, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    return {
      ok: false,
      message: error.message || "Failed to create record",
    };
  }

  revalidatePath(revalidateUrl);
  return {
    ok: true,
    message: "Record created successfully",
    data: inserted,
  };
}

export async function updateResourceAction(
  table: string,
  id: string,
  revalidateUrl: string,
  data: Record<string, unknown>
): Promise<ResourceActionResult> {
  const supabase = createClient();

  const { data: updated, error } = await supabase
    .from(table)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return {
      ok: false,
      message: error.message || "Failed to update record",
    };
  }

  revalidatePath(revalidateUrl);
  return {
    ok: true,
    message: "Record updated successfully",
    data: updated,
  };
}

export async function deleteResourceAction(
  table: string,
  id: string,
  revalidateUrl: string
): Promise<ResourceActionResult> {
  const supabase = createClient();

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message: "This record is in use. Deactivate it instead.",
      };
    }
    return {
      ok: false,
      message: error.message || "Failed to delete record",
    };
  }

  revalidatePath(revalidateUrl);
  return {
    ok: true,
    message: "Record deleted successfully",
  };
}
