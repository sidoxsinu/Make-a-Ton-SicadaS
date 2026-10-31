"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { ResourceFilter } from "@/lib/resources/types";
import { Button } from "@/components/ui/Button";

export interface FilterBarProps {
  filters?: ResourceFilter[];
  searchPlaceholder?: string;
  className?: string;
}

export function FilterBar({
  filters = [],
  searchPlaceholder = "Search...",
  className = "",
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of filters) {
      initial[f.key] = searchParams.get(f.key) || "";
    }
    return initial;
  });

  function applyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }

    for (const [key, val] of Object.entries(filterValues)) {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    }

    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleReset() {
    setQ("");
    const resetObj: Record<string, string> = {};
    for (const f of filters) {
      resetObj[f.key] = "";
    }
    setFilterValues(resetObj);
    router.push(pathname);
  }

  return (
    <form
      onSubmit={applyFilters}
      className={`flex flex-wrap items-center gap-3 py-3 px-3 bg-sheet border border-rule rounded-sm text-[13px] font-sans ${className}`}
    >
      {/* Search Input */}
      <div className="flex-1 min-w-[200px] max-w-[320px]">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-[32px] px-2.5 bg-sheet text-ink border border-rule-strong rounded-sm text-[13px] font-sans focus-visible:outline-2 focus-visible:outline-accent"
        />
      </div>

      {/* Filter selects */}
      {filters.map((filter) => {
        if (filter.type === "boolean") {
          return (
            <select
              key={filter.key}
              value={filterValues[filter.key] || ""}
              onChange={(e) =>
                setFilterValues((prev) => ({
                  ...prev,
                  [filter.key]: e.target.value,
                }))
              }
              className="h-[32px] px-2 bg-sheet text-ink border border-rule-strong rounded-sm text-[13px] font-sans focus-visible:outline-2 focus-visible:outline-accent"
            >
              <option value="">{filter.label}: All</option>
              <option value="true">{filter.label}: Yes</option>
              <option value="false">{filter.label}: No</option>
            </select>
          );
        }

        if (filter.type === "select" && filter.options) {
          return (
            <select
              key={filter.key}
              value={filterValues[filter.key] || ""}
              onChange={(e) =>
                setFilterValues((prev) => ({
                  ...prev,
                  [filter.key]: e.target.value,
                }))
              }
              className="h-[32px] px-2 bg-sheet text-ink border border-rule-strong rounded-sm text-[13px] font-sans focus-visible:outline-2 focus-visible:outline-accent"
            >
              <option value="">{filter.label}: All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        return null;
      })}

      <div className="flex items-center gap-2 ml-auto">
        <Button type="submit" variant="secondary" className="h-[32px] text-[13px] px-3">
          Filter
        </Button>
        {(q || Object.values(filterValues).some(Boolean)) && (
          <Button
            type="button"
            variant="quiet"
            onClick={handleReset}
            className="text-[12px] text-ink-2 hover:text-ink"
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
