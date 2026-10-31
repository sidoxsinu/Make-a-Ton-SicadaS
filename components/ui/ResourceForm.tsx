import React from "react";
import { ResourceFormClient } from "./ResourceFormClient";
import type { Resource } from "@/lib/resources/defineResource";

export interface ResourceFormProps {
  resource: Resource;
  initial?: Record<string, unknown>;
  mode: "create" | "edit";
  // Where to go after a successful save. Defaults to staying on the page.
  redirectTo?: string;
  cancelHref?: string;
}

// Server wrapper. A resource holds a zod schema, which cannot cross to a client
// component, so only plain data is passed and the client reads the schema from
// the registry in lib/resources.
export function ResourceForm({
  resource,
  initial,
  mode,
  redirectTo,
  cancelHref,
}: ResourceFormProps) {
  return (
    <ResourceFormClient
      name={resource.name}
      title={resource.title}
      fields={resource.fields}
      initial={initial}
      mode={mode}
      redirectTo={redirectTo}
      cancelHref={cancelHref}
    />
  );
}
