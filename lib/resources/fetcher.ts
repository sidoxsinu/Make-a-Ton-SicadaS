import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ResourceConfig } from "./types";

export interface FetchResult<T = Record<string, unknown>> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchResourceRows<T extends Record<string, unknown>>(
  resource: ResourceConfig<T>,
  searchParams?: Record<string, string | undefined>
): Promise<FetchResult<T>> {
  const supabase = createClient();
  const params = searchParams ? { ...searchParams } : {};
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from(resource.table).select("*", { count: "exact" });

  // 1. Text Search across columns
  const q = params.q?.trim();
  if (q && resource.search && resource.search.length > 0) {
    const orFilter = resource.search
      .map((col) => `${col}.ilike.%${q}%`)
      .join(",");
    query = query.or(orFilter);
  }

  // 2. Filters
  if (resource.filters) {
    for (const filter of resource.filters) {
      const val = params[filter.key];
      if (val !== undefined && val !== "") {
        if (filter.type === "boolean") {
          query = query.eq(filter.key, val === "true");
        } else {
          query = query.eq(filter.key, val);
        }
      }
    }
  }

  // 3. Sorting
  const sortCol = params.sort || resource.defaultSort?.key || "created_at";
  const sortDir = (params.dir || resource.defaultSort?.dir || "desc") === "asc";

  query = query.order(sortCol, { ascending: sortDir });

  // 4. Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error(`Error querying ${resource.table}:`, error.message);
  }

  return {
    rows: (data as T[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

