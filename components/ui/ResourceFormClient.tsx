"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./Button";
import { ErrorState } from "./ErrorState";
import { Field } from "./Field";
import { DateInput, NumberInput, Select, TextArea, TextInput, Toggle } from "./Inputs";
import { useToast } from "./Toast";
import { createResource, updateResource } from "@/lib/actions/resource";
import { getResource } from "@/lib/resources";
import type { ResourceField } from "@/lib/resources/defineResource";

export interface ResourceFormClientProps {
  name: string;
  title: string;
  fields: ResourceField[];
  initial?: Record<string, unknown>;
  mode: "create" | "edit";
  redirectTo?: string;
  cancelHref?: string;
}

export function ResourceFormClient({
  name,
  title,
  fields,
  initial,
  mode,
  redirectTo,
  cancelHref,
}: ResourceFormClientProps) {
  const router = useRouter();
  const toast = useToast();
  const resource = getResource(name);

  const defaults: Record<string, unknown> = {};
  for (const f of fields) {
    defaults[f.key] = initial?.[f.key] ?? f.default ?? (f.type === "toggle" ? false : undefined);
  }

  const form = useForm<FieldValues>({
    resolver: zodResolver(resource?.schema ?? z.object({}).passthrough()),
    defaultValues: defaults,
  });

  if (!resource) {
    return <ErrorState message="This form is not available. Reload the page." />;
  }

  const { register, control, handleSubmit, setError, formState } = form;

  async function onSubmit(values: FieldValues) {
    const id = String(initial?.id ?? "");
    const result =
      mode === "create"
        ? await createResource(name, values)
        : await updateResource(name, id, values);

    if (!result.ok) {
      for (const [key, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(key, { type: "server", message });
      }
      toast.error(result.message ?? "The change did not save. Try again.");
      return;
    }

    toast.success(result.message ?? "Saved.");
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label={`${mode === "create" ? "New" : "Edit"} ${title.toLowerCase()}`}
      className="flex flex-col gap-4 max-w-[560px]"
    >
      {fields.map((field) => {
        const error = formState.errors[field.key]?.message as string | undefined;
        const errorId = `${field.key}-error`;
        const helpId = `${field.key}-help`;
        const describedBy = error ? errorId : field.help ? helpId : undefined;
        const common = {
          id: field.key,
          "aria-invalid": error ? (true as const) : undefined,
          "aria-describedby": describedBy,
          hasError: !!error,
        };

        if (field.type === "toggle") {
          return (
            <div key={field.key} className="flex flex-col gap-1">
              <Controller
                name={field.key}
                control={control}
                render={({ field: f }) => (
                  <Toggle
                    name={field.key}
                    label={field.label}
                    checked={!!f.value}
                    onChange={f.onChange}
                  />
                )}
              />
              {error ? (
                <p id={errorId} className="text-[12px] font-sans text-bad">
                  {error}
                </p>
              ) : (
                field.help && (
                  <p id={helpId} className="text-[12px] font-sans text-ink-2">
                    {field.help}
                  </p>
                )
              )}
            </div>
          );
        }

        let input: React.ReactNode;
        if (field.type === "number") {
          input = (
            <NumberInput
              {...common}
              min={field.min}
              max={field.max}
              step={field.step}
              {...register(field.key, {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
              })}
            />
          );
        } else if (field.type === "date") {
          input = <DateInput {...common} {...register(field.key)} />;
        } else if (field.type === "textarea") {
          input = <TextArea {...common} {...register(field.key)} />;
        } else if (field.type === "select") {
          input = (
            <Select
              {...common}
              placeholder="Select"
              options={field.options ?? []}
              {...register(field.key)}
            />
          );
        } else {
          input = <TextInput {...common} {...register(field.key)} />;
        }

        return (
          <Field
            key={field.key}
            label={field.label}
            name={field.key}
            error={error}
            help={field.help}
            required={field.required}
          >
            {input}
          </Field>
        );
      })}

      <div className="flex items-center gap-4 pt-3 border-t border-rule">
        <Button type="submit" loading={formState.isSubmitting}>
          {mode === "create" ? "Create" : "Save changes"}
        </Button>
        {cancelHref && (
          <Button variant="quiet" href={cancelHref}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
