"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type Project, calculateProject, TRADE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FileDown,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export function ProjectDetail({ project: initial }: { project: Project }) {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const [project, setProject] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    actual_hours: initial.actual_hours?.toString() ?? "",
    material_cost: initial.material_cost.toString(),
    subcontractor_cost: initial.subcontractor_cost.toString(),
    notes: initial.notes ?? "",
  });

  const calc = calculateProject(project);

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    const updates = {
      actual_hours: form.actual_hours ? Number(form.actual_hours) : null,
      material_cost: Number(form.material_cost) || 0,
      subcontractor_cost: Number(form.subcontractor_cost) || 0,
      notes: form.notes || null,
      status: "completed" as const,
    };

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", project.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      setProject(data as Project);
      setEditing(false);
      toast.success("Project updated!");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!supabase) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success("Project deleted");
      router.push("/dashboard");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{project.client_name}</h1>
            <p className="text-xs text-muted-foreground">
              {project.client_address}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <SafePdfButton project={project} calc={calc} />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-red-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="mb-4 border-border bg-card">
        <CardContent className="py-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Trade</span>
              <p className="font-medium">{TRADE_LABELS[project.trade]}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Status</span>
              <p>
                <Badge
                  variant={
                    project.status === "completed" ? "outline" : "secondary"
                  }
                  className="text-xs"
                >
                  {project.status}
                </Badge>
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Hourly Rate</span>
              <p className="font-medium tabular-nums">
                ${project.hourly_rate}/hr
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created</span>
              <p className="text-muted-foreground">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hours Card */}
      <Card className="mb-4 border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Estimated</p>
              <p className="text-xl font-bold tabular-nums">{project.estimated_hours}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actual</p>
              {editing ? (
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  className="mt-1 text-center text-sm"
                  value={form.actual_hours}
                  onChange={(e) =>
                    setForm({ ...form, actual_hours: e.target.value })
                  }
                />
              ) : (
                <p className="text-xl font-bold tabular-nums">
                  {project.actual_hours != null
                    ? `${project.actual_hours}h`
                    : "—"}
                </p>
              )}
            </div>
          </div>
          {project.actual_hours != null &&
            project.actual_hours !== project.estimated_hours && (
              <p className="mt-2 text-center text-xs">
                <span
                  className={
                    project.actual_hours > project.estimated_hours
                      ? "text-red-500"
                      : "text-emerald-500"
                  }
                >
                  {project.actual_hours > project.estimated_hours ? "+" : ""}
                  {(
                    project.actual_hours - project.estimated_hours
                  ).toFixed(1)}
                  h
                </span>{" "}
                <span className="text-muted-foreground">vs estimate</span>
              </p>
            )}
        </CardContent>
      </Card>

      {/* Profit Breakdown — Hero Section */}
      <Card className="mb-4 border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profit Breakdown</CardTitle>
          <CardDescription>
            Quote &minus; costs = your real take-home
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Quote — large display */}
            <div className="rounded border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Quote Amount</span>
                <span className="text-2xl font-bold tabular-nums text-amber-500">
                  ${calc.quote_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3 rounded border border-border p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editMaterial" className="text-xs">Material Cost ($)</Label>
                  <Input
                    id="editMaterial"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.material_cost}
                    onChange={(e) =>
                      setForm({ ...form, material_cost: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editSub" className="text-xs">Subcontractor Cost ($)</Label>
                  <Input
                    id="editSub"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.subcontractor_cost}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subcontractor_cost: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Material Cost</span>
                  <span className="tabular-nums">-${project.material_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subcontractor Cost</span>
                  <span className="tabular-nums">-${project.subcontractor_cost.toLocaleString()}</span>
                </div>
              </>
            )}

            <Separator />

            {/* Net Profit — hero number */}
            <div
              className={`rounded px-4 py-3 ${
                calc.net_profit >= 0
                  ? "border border-emerald-500/20 bg-emerald-500/5"
                  : "border border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">Net Profit</span>
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    calc.net_profit >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  ${calc.net_profit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="flex items-center justify-between rounded border border-border px-4 py-2">
              <span className="text-sm text-muted-foreground">Profit Margin</span>
              <span className="text-lg font-bold tabular-nums text-amber-500">
                {calc.profit_margin}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {(project.notes || editing) && (
        <Card className="mb-4 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {editing ? (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save &amp; Complete
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={() => setEditing(true)}
          >
            Enter Costs &amp; Complete
          </Button>
        )}
      </div>
    </div>
  );
}

function sectionHeader(doc: jsPDF, title: string, y: number, margin: number) {
  doc.setFillColor(30, 36, 45);
  doc.rect(margin, y, 170, 8, "F");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + 2, y + 6);
  return y + 12;
}

function labeledRow(doc: jsPDF, label: string, value: string, y: number, margin: number) {
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text(label, margin, y);
  doc.setTextColor(255, 255, 255);
  doc.text(value, margin + 170, y, { align: "right" });
  return y + 8;
}

function generateQuotePDF(project: Project, calc: ReturnType<typeof calculateProject>) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;
  const amberR = 245;
  const amberG = 158;
  const amberB = 11;

  doc.setFillColor(30, 36, 45);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFontSize(22);
  doc.setTextColor(amberR, amberG, amberB);
  doc.text("Project Report", margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated by ProfitScope — ${new Date().toLocaleDateString()}`, margin, y);
  y += 14;

  y = sectionHeader(doc, "Client Information", y, margin);
  y = labeledRow(doc, "Client:", project.client_name, y, margin);
  y = labeledRow(doc, "Address:", project.client_address, y, margin);
  y = labeledRow(doc, "Trade:", TRADE_LABELS[project.trade], y, margin);
  y += 8;

  y = sectionHeader(doc, "Project Info", y, margin);
  y = labeledRow(doc, "Status:", project.status, y, margin);
  y = labeledRow(doc, "Created:", new Date(project.created_at).toLocaleDateString(), y, margin);
  y += 8;

  y = sectionHeader(doc, "Hours", y, margin);
  y = labeledRow(doc, "Estimated:", `${project.estimated_hours}h`, y, margin);
  y = labeledRow(doc, "Actual:", project.actual_hours != null ? `${project.actual_hours}h` : "—", y, margin);
  y += 8;

  y = sectionHeader(doc, "Quote Details", y, margin);
  y = labeledRow(doc, "Hourly Rate:", `$${project.hourly_rate}/hr`, y, margin);
  y += 6;
  doc.setDrawColor(amberR, amberG, amberB);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 170 + margin, y);
  y += 8;
  doc.setFontSize(16);
  doc.setTextColor(amberR, amberG, amberB);
  doc.text(`Quote Amount: $${calc.quote_amount.toLocaleString()}`, margin, y);
  y += 12;

  y = sectionHeader(doc, "Cost & Profit", y, margin);
  y = labeledRow(doc, "Material Cost:", `-$${project.material_cost.toLocaleString()}`, y, margin);
  y = labeledRow(doc, "Subcontractor Cost:", `-$${project.subcontractor_cost.toLocaleString()}`, y, margin);
  y += 6;
  doc.setDrawColor(amberR, amberG, amberB);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 170 + margin, y);
  y += 8;
  doc.setFontSize(16);
  doc.setTextColor(amberR, amberG, amberB);
  doc.text(`Net Profit: $${calc.net_profit.toLocaleString()}`, margin, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Profit Margin: ${calc.profit_margin}%`, margin, y);
  y += 14;

  if (project.notes) {
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text(`Notes: ${project.notes}`, margin, y, { maxWidth: 170 });
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("ProfitScope — Know what every job pays you.", margin, 280);

  doc.save(`project-report-${project.client_name.replace(/\s+/g, "-")}.pdf`);
}

function SafePdfButton({ project, calc }: { project: Project; calc: ReturnType<typeof calculateProject> }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateQuotePDF(project, calc)}
      className="h-8"
    >
      <FileDown className="mr-1.5 h-4 w-4" />
      PDF
    </Button>
  );
}
