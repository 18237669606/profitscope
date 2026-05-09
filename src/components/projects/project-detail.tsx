"use client";

import { useState } from "react";
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
  DollarSign,
  Clock,
  TrendingUp,
  Percent,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export function ProjectDetail({ project: initial }: { project: Project }) {
  const router = useRouter();
  const supabase = createClient();
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.client_name}</h1>
            <p className="text-sm text-neutral-500">
              {project.client_address}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/${project.id}/pdf`}>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Trade</span>
              <p className="font-medium">{TRADE_LABELS[project.trade]}</p>
            </div>
            <div>
              <span className="text-neutral-500">Status</span>
              <p>
                <Badge
                  variant={
                    project.status === "completed" ? "outline" : "secondary"
                  }
                >
                  {project.status}
                </Badge>
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Hourly Rate</span>
              <p className="font-medium">
                ${project.hourly_rate}/hr
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Created</span>
              <p className="text-neutral-500">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hours: Estimated vs Actual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-neutral-500">Estimated</p>
              <p className="text-2xl font-bold">{project.estimated_hours}h</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Actual</p>
              {editing ? (
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  className="mt-1 text-center"
                  value={form.actual_hours}
                  onChange={(e) =>
                    setForm({ ...form, actual_hours: e.target.value })
                  }
                />
              ) : (
                <p className="text-2xl font-bold">
                  {project.actual_hours != null
                    ? `${project.actual_hours}h`
                    : "—"}
                </p>
              )}
            </div>
          </div>
          {project.actual_hours != null &&
            project.actual_hours !== project.estimated_hours && (
              <p className="mt-3 text-center text-sm">
                <span
                  className={
                    project.actual_hours > project.estimated_hours
                      ? "text-red-500"
                      : "text-emerald-600"
                  }
                >
                  {project.actual_hours > project.estimated_hours ? "+" : ""}
                  {(
                    project.actual_hours - project.estimated_hours
                  ).toFixed(1)}
                  h
                </span>{" "}
                vs estimate
              </p>
            )}
        </CardContent>
      </Card>

      {/* Quote + Profit Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Profit Breakdown
          </CardTitle>
          <CardDescription>
            Quote — costs = your real take-home
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between rounded-md bg-neutral-50 p-3">
              <span className="font-medium">Quote Amount</span>
              <span className="text-lg font-bold">
                ${calc.quote_amount.toLocaleString()}
              </span>
            </div>

            {editing ? (
              <div className="space-y-3 rounded-md border p-3">
                <div className="space-y-2">
                  <Label htmlFor="editMaterial">Material Cost ($)</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="editSub">
                    Subcontractor Cost ($)
                  </Label>
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
                <div className="flex justify-between text-neutral-600">
                  <span>Material Cost</span>
                  <span>-${project.material_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Subcontractor Cost</span>
                  <span>
                    -${project.subcontractor_cost.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between rounded-md bg-emerald-50 p-3">
              <span className="font-bold text-emerald-800">Net Profit</span>
              <span
                className={`text-lg font-bold ${
                  calc.net_profit >= 0
                    ? "text-emerald-700"
                    : "text-red-500"
                }`}
              >
                ${calc.net_profit.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Profit Margin
                </span>
              </div>
              <Badge variant="default" className="text-base">
                {calc.profit_margin}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {project.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
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
              <p className="text-sm text-neutral-600 whitespace-pre-wrap">
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
            <TrendingUp className="mr-2 h-4 w-4" />
            Enter Costs &amp; Complete
          </Button>
        )}
      </div>
    </div>
  );
}
