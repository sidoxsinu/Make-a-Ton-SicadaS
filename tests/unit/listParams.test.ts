import { describe, it, expect } from "vitest";
import {
  parseListQuery,
  listHref,
  emptyMessage,
  PAGE_SIZE,
} from "@/lib/listParams";

describe("parseListQuery", () => {
  it("uses defaults for an empty URL", () => {
    const q = parseListQuery({}, ["status"]);
    expect(q).toMatchObject({ page: 1, pageSize: PAGE_SIZE, dir: "asc", q: "", filters: {} });
  });

  it("reads page, sort, dir, q and declared filters only", () => {
    const q = parseListQuery(
      { page: "3", sort: "due_date", dir: "desc", q: " acme ", status: "confirmed", other: "x" },
      ["status"]
    );
    expect(q.page).toBe(3);
    expect(q.sort).toBe("due_date");
    expect(q.dir).toBe("desc");
    expect(q.q).toBe("acme");
    expect(q.filters).toEqual({ status: "confirmed" });
  });

  it("falls back on bad page and unknown sort key", () => {
    const q = parseListQuery({ page: "-4", sort: "drop_table" }, [], {
      sortableKeys: ["name"],
      defaultSort: { key: "name", dir: "desc" },
    });
    expect(q.page).toBe(1);
    expect(q.sort).toBe("name");
    expect(q.dir).toBe("desc");
  });

  it("ignores empty filter values", () => {
    expect(parseListQuery({ status: "" }, ["status"]).filters).toEqual({});
  });
});

describe("listHref", () => {
  const base = parseListQuery({ sort: "name", dir: "asc", status: "active" }, ["status"]);

  it("omits page 1 and keeps state", () => {
    expect(listHref("/plans", base)).toBe("/plans?sort=name&dir=asc&status=active");
  });

  it("applies a patch and resets page when asked", () => {
    expect(listHref("/plans", base, { page: 2 })).toBe("/plans?page=2&sort=name&dir=asc&status=active");
    expect(listHref("/plans", base, { sort: "price", dir: "desc", page: 1 })).toBe(
      "/plans?sort=price&dir=desc&status=active"
    );
  });

  it("returns the bare path when nothing is set", () => {
    expect(listHref("/plans", parseListQuery({}, []))).toBe("/plans");
  });
});

describe("emptyMessage", () => {
  const fields = [
    { key: "q", label: "Search", type: "text" as const },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [{ value: "confirmed", label: "Confirmed" }],
    },
  ];

  it("states a plain fact with no filters", () => {
    expect(emptyMessage("Taxes", parseListQuery({}, ["status"]), fields)).toBe("No taxes yet.");
  });

  it("names every active filter", () => {
    const q = parseListQuery({ q: "acme", status: "confirmed" }, ["status"]);
    expect(emptyMessage("Invoices", q, fields)).toBe(
      'No invoices match search "acme" and status "Confirmed". Clear the filters to see all invoices.'
    );
  });
});
