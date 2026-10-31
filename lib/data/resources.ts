import "server-only";
import type { Resource } from "@/lib/resources/defineResource";
import type { ListQuery } from "@/lib/listParams";
import type { ListResult, Row } from "./types";
import { createClient } from "@/lib/supabase/server";

export async function listRows(
  resource: Resource,
  query: ListQuery
): Promise<ListResult<Row>> {
  const supabase = createClient();
  let request = supabase.from(resource.table).select("*", { count: "planned" });
  if (query.q && resource.search.length > 0) {
    const search = resource.search
      .map((key) => `${key}.ilike.%${query.q.replace(/[(),]/g, "")}%`)
      .join(",");
    request = request.or(search);
  }
  for (const filter of resource.filters) {
    const value = query.filters[filter.key];
    if (value === undefined) continue;
    request = filter.type === "text"
      ? request.ilike(filter.key, `%${value}%`)
      : request.eq(filter.key, value);
  }
  if (query.sort) {
    request = request.order(query.sort, { ascending: query.dir === "asc" });
  }
  const start = (query.page - 1) * query.pageSize;
  const { data, count, error } = await request.range(start, start + query.pageSize - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Row[], total: count ?? 0 };
}
