import type { Resource } from "./defineResource";

// Registry of every resource, keyed by name. Phase D adds one import and one
// entry per resource. Client forms look up their zod schema here, because a
// resource object cannot cross from a server component to a client component.
export const RESOURCES: Record<string, Resource> = {};

export function getResource(name: string): Resource | undefined {
  return RESOURCES[name];
}
