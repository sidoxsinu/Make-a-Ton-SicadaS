import type { ResourceConfig } from "./types";
import { customersResource } from "./customers";
import { productsResource } from "./products";
import { plansResource } from "./plans";
import { discountsResource } from "./discounts";
import { paymentTermsResource } from "./paymentTerms";
import { taxesResource } from "./taxes";
import { templatesResource } from "./templates";

// Registry of every resource, keyed by name.
// Client forms look up their schema and config here, because a Zod schema / function
// object cannot cross from a server component to a client component.
export const RESOURCES: Record<string, ResourceConfig<any>> = {
  customers: customersResource,
  products: productsResource,
  plans: plansResource,
  discounts: discountsResource,
  payment_terms: paymentTermsResource,
  paymentTerms: paymentTermsResource,
  taxes: taxesResource,
  quotation_templates: templatesResource,
  templates: templatesResource,
};

export function getResource<T = Record<string, unknown>>(
  name: string
): ResourceConfig<T> | undefined {
  return RESOURCES[name] as ResourceConfig<T> | undefined;
}
