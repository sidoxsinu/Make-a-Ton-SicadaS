import React from "react";
import { notFound } from "next/navigation";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "./ProductDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", params.id);

  return (
    <TeamShell title={`Product: ${product.name}`}>
      <ProductDetailClient
        product={product}
        initialVariants={variants || []}
      />
    </TeamShell>
  );
}
