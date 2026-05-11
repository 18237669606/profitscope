"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { type Trade, TRADE_OPTIONS, calculateProject } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Step = 1 | 2;

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [trade, setTrade] = useState<Trade>("general");
  const [hourlyRate, setHourlyRate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  const [materialCost, setMaterialCost] = useState("");
  const [subcontractorCost, setSubcontractorCost] = useState("");
  const [notes, setNotes] = useState("");

  const preview = calculateProject({
    hourly_rate: Number(hourlyRate) || 0,
    estimated_hours: Number(estimatedHours) || 0,
    material_cost: 0,
    subcontractor_cost: 0,
  });

  const fullPreview = calculateProject({
    hourly_rate: Number(hourlyRate) || 0,
    estimated_hours: Number(estimatedHours) || 0,
    material_cost: Number(materialCost) || 0,
    subcontractor_cost: Number(subcontractorCost) || 0,
  });

  const handleSubmit = async () => {
    if (!supabase) return;
    if (!user) {
      toast.error("You must be signed in to create a project.");
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      client_name: clientName,
      client_address: clientAddress,
      trade,
      hourly_rate: Number(hourlyRate),
      estimated_hours: Number(estimatedHours),
      material_cost: Number(materialCost) || 0,
      subcontractor_cost: Number(subcontractorCost) || 0,
      notes: notes || null,
    });

    if (error) {
      toast.error("Failed to create project: " + error.message);
      setSubmitting(false);
    } else {
      toast.success("Project created!");
      router.push("/dashboard");
    }
  };

  const canGoNext =
    step === 1 &&
    clientName.trim() &&
    clientAddress.trim() &&
    Number(hourlyRate) > 0 &&
    Number(estimatedHours) > 0;

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="mb-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight">
          New Project
        </h1>
      </div>

      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-3">
        <span className={`text-sm font-medium ${step === 1 ? "text-amber-500" : "text-muted-foreground"}`}>
          1. Quote Details
        </span>
        <Separator className="flex-1" />
        <span className={`text-sm font-medium ${step === 2 ? "text-amber-500" : "text-muted-foreground"}`}>
          2. Costs &amp; Finish
        </span>
      </div>

      {step === 1 ? (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quote Details</CardTitle>
            <CardDescription>
              Enter the job info to calculate your quote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="John Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress">Job Address *</Label>
              <Input
                id="clientAddress"
                placeholder="123 Main St, Austin TX"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Trade *</Label>
              <Select
                value={trade}
                onValueChange={(v) => setTrade(v as Trade)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="85"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Est. Hours *</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="8"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                />
              </div>
            </div>

            {/* Live preview */}
            {preview.quote_amount > 0 && (
              <div className="rounded border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Quote Amount</span>
                  <span className="text-xl font-bold tabular-nums text-amber-500">
                    ${preview.quote_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!canGoNext}
              onClick={() => setStep(2)}
            >
              Next: Costs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Costs &amp; Notes</CardTitle>
            <CardDescription>
              Track expenses to see your real profit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="materialCost">Material Cost ($)</Label>
              <Input
                id="materialCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcontractorCost">
                Subcontractor Cost ($)
              </Label>
              <Input
                id="subcontractorCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={subcontractorCost}
                onChange={(e) => setSubcontractorCost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details about this job..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Full preview */}
            {fullPreview.quote_amount > 0 && (
              <div className="rounded border border-border bg-card px-4 py-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quote</span>
                    <span className="font-medium tabular-nums">
                      ${fullPreview.quote_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="tabular-nums">
                      ${fullPreview.total_cost.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Net Profit</span>
                    <span
                      className={`text-base font-bold tabular-nums ${
                        fullPreview.net_profit >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      ${fullPreview.net_profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin</span>
                    <span className="font-medium tabular-nums">
                      {fullPreview.profit_margin}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
