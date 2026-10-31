"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button variant="primary" onClick={() => window.print()}>
      Print / Save PDF
    </Button>
  );
}
