import React from "react";
import { Badge } from "./Badge";
import { DateText } from "./DateText";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { FilterBar } from "./FilterBar";
import { Money } from "./Money";
import { Pager } from "./Pager";
import { StaggerRows } from "./Stagger";
import { Table, type Column } from "./Table";
import { getSession } from "@/lib/data/session";
import { listRows } from "@/lib/data/resources";
import type { Row } from "@/lib/data/types";
import {
  emptyMessage,
  hasActiveFilters,
  listHref,
  parseListQuery,
  type FilterField,
  type SearchParams,
} from "@/lib/listParams";
import type { Resource, ResourceColumn } from "@/lib/resources/defineResource";

export interface ResourceListProps {
  resource: Resource;
  searchParams: SearchParams;
}

function titleCase(key: string): string {
  const spaced = key.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function percent(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? `${Number(n.toFixed(2))}%` : "-";
}

function renderCell(col: ResourceColumn, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return "-";
  switch (col.type) {
    case "money":
      return <Money value={value as number | string} />;
    case "date":
      return <DateText value={value as string} />;
    case "badge":
      return <Badge status={String(value)} />;
    case "boolean":
      return value ? "Yes" : "No";
    case "percent":
      return percent(value);
    default:
      return String(value);
  }
}

function toTableColumn(col: ResourceColumn): Column<Row> {
  const numeric = col.type === "number" || col.type === "money" || col.type === "percent";
  return {
    key: col.key,
    label: col.label,
    sortable: col.sortable,
    align: col.align ?? (numeric ? "right" : "left"),
    type: col.type === "number" || col.type === "money" || col.type === "date" || col.type === "badge"
      ? col.type
      : col.type === "percent"
      ? "number"
      : "text",
    render: (row) => renderCell(col, row[col.key]),
  };
}

export async function ResourceList({ resource, searchParams }: ResourceListProps) {
  const session = await getSession();
  if (!session || !resource.permissions.read.includes(session.role)) {
    return <ErrorState message="You do not have access to this." />;
  }

  const canWrite = resource.permissions.write.includes(session.role);

  const filterFields: FilterField[] = [];
  if (resource.search.length > 0) {
    filterFields.push({ key: "q", label: "Search", type: "text" });
  }
  for (const filter of resource.filters) {
    filterFields.push({
      key: filter.key,
      label:
        filter.label ??
        resource.columns.find((c) => c.key === filter.key)?.label ??
        titleCase(filter.key),
      type: filter.type,
      options: filter.options,
    });
  }

  const query = parseListQuery(
    searchParams,
    resource.filters.map((f) => f.key),
    {
      sortableKeys: resource.columns.filter((c) => c.sortable).map((c) => c.key),
      defaultSort: resource.defaultSort,
    }
  );

  let result;
  try {
    result = await listRows(resource, query);
  } catch {
    return (
      <ErrorState
        message={`The ${resource.title.toLowerCase()} list did not load. Reload the page or change the filters.`}
        actionHref={listHref(resource.path, query)}
      />
    );
  }

  const rowHref = (row: Row) =>
    resource.detail ? `${resource.path}/${row.id}` : `${resource.path}?edit=${row.id}`;

  const triggerKey = listHref(resource.path, query);

  return (
    <section aria-label={resource.title} className="flex flex-col gap-3">
      {filterFields.length > 0 && <FilterBar fields={filterFields} />}

      <StaggerRows triggerKey={triggerKey}>
        <Table<Row>
          columns={resource.columns.map(toTableColumn)}
          rows={result.rows}
          sort={query.sort ? { key: query.sort, dir: query.dir } : undefined}
          onSortHref={(key, nextDir) =>
            listHref(resource.path, query, { sort: key, dir: nextDir, page: 1 })
          }
          rowHref={rowHref}
          empty={
            <EmptyState
              message={emptyMessage(resource.title, query, filterFields)}
              actionLabel={
                canWrite && !hasActiveFilters(query)
                  ? `Add ${resource.title.toLowerCase()}`
                  : undefined
              }
              actionHref={`${resource.path}?new=1`}
            />
          }
        />
      </StaggerRows>

      {result.total > 0 && (
        <Pager
          page={query.page}
          pageSize={query.pageSize}
          total={result.total}
          hrefFor={(page) => listHref(resource.path, query, { page })}
        />
      )}
    </section>
  );
}
