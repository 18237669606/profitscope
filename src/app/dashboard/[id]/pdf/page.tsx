"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { type Project, calculateProject, TRADE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

const QuotePDF = dynamic(
  () => import("@/components/pdf/quote-pdf").then((m) => m.QuotePDF),
  { ssr: false }
);

const PDFDownloadLink = dynamic(
  () =>
    import("@react-pdf/renderer").then((m) => {
      const Link = m.PDFDownloadLink;
      return {
        default: function DownloadBtn({ project }: { project: Project }) {
          return (
            <Link
              document={<QuotePDF project={project} />}
              fileName={`quote-${project.client_name.replace(/\s+/g, "-")}.pdf`}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {({ loading }: { loading: boolean }) => (
                <Button disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Generating PDF..." : "Download PDF"}
                </Button>
              )}
            </Link>
          );
        },
      };
    }),
  { ssr: false }
);

export default function PDFExportPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProject() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      setProject(data as Project);
      setLoading(false);
    }
    fetchProject();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  const calc = calculateProject(project);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href={`/dashboard/${project.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back to Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export PDF Quote</CardTitle>
          <CardDescription>
            Download a professional quote PDF to share with your client.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-md border p-4">
            <div className="flex justify-between">
              <span className="text-neutral-500">Client</span>
              <span className="font-medium">{project.client_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Address</span>
              <span>{project.client_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Trade</span>
              <span>{TRADE_LABELS[project.trade]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Quote Amount</span>
              <span className="text-lg font-bold text-blue-600">
                ${calc.quote_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <PDFDownloadLink project={project} />
        </CardContent>
      </Card>
    </div>
  );
}
