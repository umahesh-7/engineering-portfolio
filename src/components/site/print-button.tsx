"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" className="no-print" onClick={() => window.print()}>
      <PrinterIcon aria-hidden="true" />
      Print or save as PDF
    </Button>
  );
}
