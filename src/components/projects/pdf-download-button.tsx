"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import type { Project } from "@/lib/types";

const PDFDownloadLink = dynamic(
  () =>
    import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const QuotePDF = dynamic(
  () =>
    import("@/components/pdf/quote-pdf").then((mod) => mod.QuotePDF),
  { ssr: false }
);

export function PdfDownloadButton({ project }: { project: Project }) {
  return (
    <PDFDownloadLink
      document={<QuotePDF project={project} />}
      fileName={`quote-${project.client_name.replace(/\s+/g, "-")}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          {loading ? "Generating..." : "PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
