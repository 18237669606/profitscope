"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { type Trade, TRADE_OPTIONS, calculateProject } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  DollarSign,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Step = 1 | 2;

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Quote info
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [trade, setTrade] = useState<Trade>("general");
  const [hourlyRate, setHourlyRate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  // Step 2: Costs & notes
  const [materialCost, setMaterialCost] = useState("");
  const [subcontractorCost, setSubcontractorCost] = useState("");
  const [notes, setNotes] = useState("");

  // Live calculation preview for step 1
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
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          New Project
        </h1>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        <Badge variant={step === 1 ? "default" : "secondary"}>Step 1</Badge>
        <span className="text-sm text-neutral-400">
          {step === 1 ? "Quote Details" : "Costs & Finish"}
        </span>
        <Separator className="flex-1" />
        <Badge variant={step === 2 ? "default" : "outline"}>Step 2</Badge>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
            <CardDescription>
              Enter the job info to calculate your quote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="John Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            {/* Client Address */}
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Job Address *</Label>
              <Input
                id="clientAddress"
                placeholder="123 Main St, Austin TX"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>

            {/* Trade */}
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

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="85"
                  className="pl-9"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours *</Label>
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

            {/* Live preview */}
            {preview.quote_amount > 0 && (
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">
                      Quote Amount:{" "}
                      <strong>
                        ${preview.quote_amount.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Costs &amp; Notes</CardTitle>
            <CardDescription>
              Track your expenses so you know real profit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Material Cost */}
            <div className="space-y-2">
              <Label htmlFor="materialCost">Material Cost ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="materialCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="pl-9"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(e.target.value)}
                />
              </div>
            </div>

            {/* Subcontractor Cost */}
            <div className="space-y-2">
              <Label htmlFor="subcontractorCost">
                Subcontractor Cost ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="subcontractorCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="pl-9"
                  value={subcontractorCost}
                  onChange={(e) => setSubcontractorCost(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
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
              <Card className="border-emerald-100 bg-emerald-50">
                <CardContent className="py-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Quote</span>
                      <span className="font-medium">
                        ${fullPreview.quote_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Cost</span>
                      <span>
                        ${fullPreview.total_cost.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Net Profit</span>
                      <span
                        className={`font-bold ${
                          fullPreview.net_profit >= 0
                            ? "text-emerald-700"
                            : "text-red-500"
                        }`}
                      >
                        ${fullPreview.net_profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Margin</span>
                      <Badge variant="default">
                        {fullPreview.profit_margin}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
