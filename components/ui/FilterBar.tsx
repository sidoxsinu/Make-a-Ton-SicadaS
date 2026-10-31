"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./Button";
import { Field } from "./Field";
import { DateInput, NumberInput, Select, TextInput } from "./Inputs";
import type { FilterField } from "@/lib/listParams";

export interface FilterBarProps {
  fields: FilterField[];
  applyLabel?: string;
}

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

function FilterBarInner({ fields, applyLabel = "Apply" }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useSearchParams() ?? new URLSearchParams();

  const fieldKeys = new Set(fields.map((f) => f.key));
  const kept: [string, string][] = [];
  params.forEach((value, key) => {
    if (key !== "page" && !fieldKeys.has(key)) kept.push([key, value]);
  });

  const hasActive = fields.some((f) => (params.get(f.key) ?? "") !== "");
  const clearParams = new URLSearchParams(kept);
  const clearHref = clearParams.toString()
    ? `${pathname}?${clearParams.toString()}`
    : pathname;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams(kept);
    for (const field of fields) {
      const value = String(data.get(field.key) ?? "").trim();
      if (value) next.set(field.key, value);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      key={params.toString()}
      method="get"
      action={pathname}
      onSubmit={onSubmit}
      role="search"
      className="flex flex-wrap items-end gap-3 pb-3 border-b border-rule"
    >
      {kept.map(([key, value]) => (
        <input key={`${key}-${value}`} type="hidden" name={key} value={value} />
      ))}

      {fields.map((field) => {
        const id = `filter-${field.key}`;
        const current = params.get(field.key) ?? "";
        let control: React.ReactNode;

        if (field.type === "select" || field.type === "boolean") {
          control = (
            <Select
              id={id}
              name={field.key}
              defaultValue={current}
              placeholder="All"
              options={field.type === "boolean" ? BOOLEAN_OPTIONS : field.options ?? []}
              className="w-[180px]"
            />
          );
        } else if (field.type === "date") {
          control = (
            <DateInput id={id} name={field.key} defaultValue={current} className="w-[160px]" />
          );
        } else if (field.type === "number") {
          control = (
            <NumberInput id={id} name={field.key} defaultValue={current} className="w-[120px]" />
          );
        } else {
          control = (
            <TextInput id={id} name={field.key} defaultValue={current} className="w-[240px]" />
          );
        }

        return (
          <Field key={field.key} label={field.label} name={id}>
            {control}
          </Field>
        );
      })}

      <div className="flex items-center gap-3 h-[36px]">
        <Button type="submit" variant="secondary">
          {applyLabel}
        </Button>
        {hasActive && (
          <Link
            href={clearHref}
            className="text-[13px] font-sans text-ink underline decoration-1 underline-offset-2 hover:text-ink-2"
          >
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}

export function FilterBar(props: FilterBarProps) {
  return (
    <Suspense fallback={null}>
      <FilterBarInner {...props} />
    </Suspense>
  );
}
