import React from "react";
import { notFound } from "next/navigation";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { TemplateDetailClient } from "./TemplateDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: template } = await supabase
    .from("quotation_templates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!template) {
    notFound();
  }

  const { data: lines } = await supabase
    .from("quotation_template_lines")
    .select("*")
    .eq("template_id", params.id)
    .order("position", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select("id, name, sales_price")
    .order("name", { ascending: true });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, attribute, value, extra_price")
    .order("attribute", { ascending: true });

  return (
    <TeamShell title={`Template: ${template.name}`}>
      <TemplateDetailClient
        template={template}
        initialLines={lines || []}
        products={products || []}
        variants={variants || []}
      />
    </TeamShell>
  );
}

