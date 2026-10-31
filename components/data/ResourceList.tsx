"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResourceConfig, ResourceColumn } from "@/lib/resources/types";
import { Table, Column } from "@/components/ui/Table";
import { Pager } from "@/components/ui/Pager";
import { FilterBar } from "@/components/data/FilterBar";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { ResourceForm } from "@/components/data/ResourceForm";
import { deleteResourceAction } from "@/lib/resources/actions";
import { useToast } from "@/components/ui/Toast";
import { getResource } from "@/lib/resources";

export interface ResourceListProps<T = Record<string, unknown>> {
  resource?: ResourceConfig<T> | string;
  resourceName?: string;
  rows: T[];
  total: number;
  page: number;
  pageSize?: number;
  canWrite?: boolean;
  basePath: string;
  hasRowHref?: boolean;
  searchParams: Record<string, string | undefined>;
  rowHref?: (row: T) => string;
}

export function ResourceList<T extends Record<string, unknown>>({
  resource: resourceProp,
  resourceName,
  rows,
  total,
  page,
  pageSize = 25,
  canWrite = true,
  basePath,
  hasRowHref,
  searchParams,
  rowHref,
}: ResourceListProps<T>) {
  const router = useRouter();
  const toast = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resolvedName =
    typeof resourceProp === "string"
      ? resourceProp
      : resourceName ||
        (resourceProp && typeof resourceProp === "object" ? resourceProp.name : "");

  const clientResource = getResource<T>(resolvedName);
  const resource =
    clientResource ||
    (typeof resourceProp === "object" ? (resourceProp as ResourceConfig<T>) : null);

  if (!resource) {
    return (
      <div className="p-4 border border-bad text-bad font-mono text-[13px]">
        Resource configuration for &quot;{resolvedName}&quot; could not be loaded.
      </div>
    );
  }

  const resConfig = resource;

  // Convert ResourceColumns to Table Columns
  const tableColumns: Column<T>[] = resource.columns.map((col: ResourceColumn<T>) => {
    return {
      key: col.key,
      label: col.label,
      align: col.align,
      sortable: col.sortable,
      render: (row: T, index: number) => {
        if (col.render) return col.render(row, index);

        const val = row[col.key];

        if (col.type === "money") {
          return <Money value={val as number | string} />;
        }
        if (col.type === "percent") {
          return (
            <span className="font-mono text-[13px] tabular-nums text-ink">
              {Number(val || 0)}%
            </span>
          );
        }
        if (col.type === "date") {
          return <DateText value={val as string | Date} />;
        }
        if (col.type === "badge") {
          return <Badge status={String(val || "")} />;
        }
        if (col.type === "boolean") {
          return (
            <span
              className={`font-mono text-[11px] font-semibold uppercase ${
                val ? "text-ok" : "text-ink-2"
              }`}
            >
              {val ? "Yes" : "No"}
            </span>
          );
        }

        return String(val ?? "-");
      },
    };
  });

  // Action column if editable/deletable
  if (canWrite) {
    tableColumns.push({
      key: "__actions",
      label: "Actions",
      align: "right",
      render: (row: T) => (
        <div className="flex items-center justify-end gap-3 text-[13px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingRow(row);
              setDrawerOpen(true);
            }}
            className="text-ink underline decoration-1 decoration-rule hover:text-accent"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="text-bad underline decoration-1 decoration-rule hover:opacity-80"
          >
            Delete
          </button>
        </div>
      ),
    });
  }

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  function handleSortHref(key: string, nextDir: "asc" | "desc") {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    params.set("sort", key);
    params.set("dir", nextDir);
    params.set("page", "1");
    return `${basePath}?${params.toString()}`;
  }

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    setDeleting(true);

    const res = await deleteResourceAction(
      resConfig.table,
      String(deleteTarget.id),
      basePath
    );
    setDeleting(false);
    setDeleteTarget(null);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* List Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-3">
        <div>
          <h2 className="text-[18px] font-sans font-semibold text-ink">
            {resource.title}
          </h2>
          <p className="text-[12px] font-sans text-ink-2">
            Total {total.toLocaleString()} {total === 1 ? "record" : "records"}
          </p>
        </div>

        {canWrite && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingRow(null);
              setDrawerOpen(true);
            }}
          >
            New {resource.singularTitle}
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={resource.filters}
        searchPlaceholder={`Search ${resource.title.toLowerCase()}...`}
      />

      {/* Table */}
      <Table
        columns={tableColumns}
        rows={rows}
        rowHref={
          rowHref || (hasRowHref ? (r) => `${basePath}/${(r as any).id}` : undefined)
        }
        sort={
          searchParams.sort
            ? {
                key: searchParams.sort,
                dir: (searchParams.dir as "asc" | "desc") || "asc",
              }
            : resource.defaultSort
        }
        onSortHref={handleSortHref}
        empty={
          <EmptyState
            message={`No ${resource.title.toLowerCase()} found.`}
            actionLabel={canWrite ? `Add ${resource.singularTitle}` : undefined}
            onAction={
              canWrite
                ? () => {
                    setEditingRow(null);
                    setDrawerOpen(true);
                  }
                : undefined
            }
          />
        }
      />

      {/* Pager */}
      {total > 0 && (
        <Pager
          page={page}
          pageSize={pageSize}
          total={total}
          hrefFor={hrefForPage}
        />
      )}

      {/* Create / Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingRow(null);
        }}
        title={
          editingRow
            ? `Edit ${resource.singularTitle}`
            : `Create ${resource.singularTitle}`
        }
      >
        <ResourceForm
          resource={resource}
          initialData={editingRow || undefined}
          revalidateUrl={basePath}
          onSuccess={() => {
            setDrawerOpen(false);
            setEditingRow(null);
            router.refresh();
          }}
          onCancel={() => {
            setDrawerOpen(false);
            setEditingRow(null);
          }}
        />
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        title={`Delete ${resource.singularTitle}`}
        body={`Are you sure you want to delete this ${resource.singularTitle.toLowerCase()}? This action cannot be undone.`}
        confirmLabel="Delete Record"
        cancelLabel="Keep Record"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
