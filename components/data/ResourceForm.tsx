"use client";

import React, { useState } from "react";
import type { ResourceConfig } from "@/lib/resources/types";
import { createResourceAction, updateResourceAction } from "@/lib/resources/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput, NumberInput, DateInput, TextArea, Select, Toggle } from "@/components/ui/Inputs";
import { useToast } from "@/components/ui/Toast";

export interface ResourceFormProps<T = Record<string, unknown>> {
  resource: ResourceConfig<T>;
  initialData?: Record<string, unknown>;
  revalidateUrl: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResourceForm<T = Record<string, unknown>>({
  resource,
  initialData,
  revalidateUrl,
  onSuccess,
  onCancel,
}: ResourceFormProps<T>) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const data: Record<string, unknown> = { ...initialData };
    for (const f of resource.fields) {
      if (data[f.key] === undefined) {
        data[f.key] = f.default !== undefined ? f.default : "";
      }
    }
    return data;
  });

  function handleChange(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate with zod schema
    const parsed = resource.schema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const payload = parsed.data as Record<string, unknown>;
    let res;
    if (initialData?.id) {
      res = await updateResourceAction(
        resource.table,
        initialData.id as string,
        revalidateUrl,
        payload
      );
    } else {
      res = await createResourceAction(resource.table, revalidateUrl, payload);
    }

    setLoading(false);

    if (res.ok) {
      toast.success(res.message);
      onSuccess?.();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {resource.fields.map((field) => {
        const err = errors[field.key];
        const val = formData[field.key];

        return (
          <Field
            key={field.key}
            label={field.label}
            name={field.key}
            error={err}
            help={field.help}
            required={field.required}
          >
            {field.type === "text" && (
              <TextInput
                value={(val as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                hasError={Boolean(err)}
              />
            )}

            {field.type === "number" && (
              <NumberInput
                value={(val as number | string) ?? ""}
                onChange={(e) =>
                  handleChange(
                    field.key,
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                hasError={Boolean(err)}
              />
            )}

            {field.type === "date" && (
              <DateInput
                value={(val as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                hasError={Boolean(err)}
              />
            )}

            {field.type === "textarea" && (
              <TextArea
                value={(val as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                hasError={Boolean(err)}
              />
            )}

            {field.type === "select" && field.options && (
              <Select
                value={(val as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                options={field.options}
                placeholder={field.placeholder || "Select option..."}
                hasError={Boolean(err)}
              />
            )}

            {field.type === "toggle" && (
              <Toggle
                checked={Boolean(val)}
                onChange={(checked) => handleChange(field.key, checked)}
                label={field.placeholder}
              />
            )}
          </Field>
        );
      })}

      <div className="pt-4 flex items-center justify-end gap-3 border-t border-rule">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData?.id ? "Save Changes" : `Create ${resource.singularTitle}`}
        </Button>
      </div>
    </form>
  );
}
