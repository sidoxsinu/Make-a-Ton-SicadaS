import "server-only";
import type { Resource } from "@/lib/resources/defineResource";
import type { ListQuery } from "@/lib/listParams";
import { MOCK_TABLES } from "./mock";
import type { ListResult, Row } from "./types";

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// Shape of doc 04 section 3 "list": reads page, sort, dir, q and declared
// filters, returns one page of rows and the total.
export async function listRows(
  resource: Resource,
  query: ListQuery
): Promise<ListResult<Row>> {
  let rows: Row[] = [...(MOCK_TABLES[resource.name] ?? [])];

  if (query.q && resource.search.length > 0) {
    const needle = query.q.toLowerCase();
    rows = rows.filter((row) =>
      resource.search.some((key) =>
        String(row[key] ?? "").toLowerCase().includes(needle)
      )
    );
  }

  for (const filter of resource.filters) {
    const value = query.filters[filter.key];
    if (value === undefined) continue;
    rows = rows.filter((row) => {
      const cell = String(row[filter.key] ?? "").toLowerCase();
      return filter.type === "text"
        ? cell.includes(value.toLowerCase())
        : cell === value.toLowerCase();
    });
  }

  if (query.sort) {
    const key = query.sort;
    const sign = query.dir === "desc" ? -1 : 1;
    rows.sort((a, b) => sign * compare(a[key], b[key]));
  }

  const total = rows.length;
  const start = (query.page - 1) * query.pageSize;
  return { rows: rows.slice(start, start + query.pageSize), total };
}
