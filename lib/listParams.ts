// List page contract helpers. State lives in the URL:
// ?page=2&sort=due_date&dir=desc&status=confirmed&q=acme

export const PAGE_SIZE = 25;

export type SearchParams = Record<string, string | string[] | undefined>;
export type SortDir = "asc" | "desc";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "boolean" | "date" | "number";
  options?: FilterOption[];
}

export interface ListQuery {
  page: number;
  pageSize: number;
  sort?: string;
  dir: SortDir;
  q: string;
  filters: Record<string, string>;
}

export interface ParseOptions {
  sortableKeys?: string[];
  defaultSort?: { key: string; dir: SortDir };
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseListQuery(
  searchParams: SearchParams | undefined,
  filterKeys: string[],
  options: ParseOptions = {}
): ListQuery {
  const sp = searchParams ?? {};

  const rawPage = parseInt(first(sp.page) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, 100000) : 1;

  const rawSort = first(sp.sort);
  const sortAllowed =
    rawSort !== undefined &&
    rawSort !== "" &&
    (!options.sortableKeys || options.sortableKeys.includes(rawSort));
  const sort = sortAllowed ? rawSort : options.defaultSort?.key;

  const rawDir = first(sp.dir);
  const dir: SortDir =
    rawDir === "asc" || rawDir === "desc"
      ? rawDir
      : sortAllowed
      ? "asc"
      : options.defaultSort?.dir ?? "asc";

  const q = (first(sp.q) ?? "").trim();

  const filters: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = (first(sp[key]) ?? "").trim();
    if (value !== "") filters[key] = value;
  }

  return { page, pageSize: PAGE_SIZE, sort, dir, q, filters };
}

export interface HrefPatch {
  page?: number;
  sort?: string;
  dir?: SortDir;
  q?: string;
  filters?: Record<string, string | undefined>;
}

export function listHref(
  path: string,
  query: ListQuery,
  patch: HrefPatch = {}
): string {
  const page = patch.page ?? query.page;
  const sort = patch.sort ?? query.sort;
  const dir = patch.dir ?? query.dir;
  const q = patch.q ?? query.q;
  const filters: Record<string, string | undefined> = {
    ...query.filters,
    ...(patch.filters ?? {}),
  };

  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sort) {
    params.set("sort", sort);
    params.set("dir", dir);
  }
  if (q) params.set("q", q);
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function hasActiveFilters(query: ListQuery): boolean {
  return query.q !== "" || Object.keys(query.filters).length > 0;
}

function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

// Names every active filter so the empty state can say what to clear.
export function describeActiveFilters(
  query: ListQuery,
  fields: FilterField[]
): string[] {
  const parts: string[] = [];
  if (query.q) parts.push(`search "${query.q}"`);
  for (const [key, value] of Object.entries(query.filters)) {
    const field = fields.find((f) => f.key === key);
    const label = field?.label ?? key;
    const option = field?.options?.find((o) => o.value === value);
    parts.push(`${label.toLowerCase()} "${option?.label ?? value}"`);
  }
  return parts;
}

export function emptyMessage(
  title: string,
  query: ListQuery,
  fields: FilterField[]
): string {
  const parts = describeActiveFilters(query, fields);
  if (parts.length === 0) return `No ${title.toLowerCase()} yet.`;
  return `No ${title.toLowerCase()} match ${joinList(parts)}. Clear the filters to see all ${title.toLowerCase()}.`;
}
