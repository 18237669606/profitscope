"use client";

import { useState } from "react";
import Link from "next/link";
import { type Project, calculateProject, TRADE_LABELS } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutGrid,
  List,
  ArrowRight,
  FileText,
  DollarSign,
} from "lucide-react";

type ViewMode = "table" | "cards";

export function ProjectList({ projects }: { projects: Project[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-neutral-300" />
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Create your first project to start tracking profits.
          </p>
          <Link href="/dashboard/new" className="mt-4">
            <Button>
              <DollarSign className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="mb-4 flex justify-end gap-1">
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("table")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "cards" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("cards")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {viewMode === "table" ? (
        <ProjectTable projects={projects} />
      ) : (
        <ProjectCards projects={projects} />
      )}
    </div>
  );
}

function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Trade</TableHead>
            <TableHead className="text-right">Quote</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const calc = calculateProject(project);
            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  {project.client_name}
                </TableCell>
                <TableCell className="text-neutral-500">
                  {TRADE_LABELS[project.trade]}
                </TableCell>
                <TableCell className="text-right">
                  ${calc.quote_amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-neutral-500">
                  ${calc.total_cost.toLocaleString()}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    calc.net_profit >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  ${calc.net_profit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={calc.profit_margin >= 20 ? "default" : "secondary"}
                  >
                    {calc.profit_margin}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.status === "completed" ? "outline" : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/${project.id}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectCards({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const calc = calculateProject(project);
        return (
          <Link key={project.id} href={`/dashboard/${project.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.client_name}</h3>
                    <p className="text-sm text-neutral-500">
                      {TRADE_LABELS[project.trade]}
                    </p>
                  </div>
                  <Badge
                    variant={
                      project.status === "completed" ? "outline" : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Quote</span>
                    <span className="font-medium">
                      ${calc.quote_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Cost</span>
                    <span>${calc.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium">Profit</span>
                    <span
                      className={`font-bold ${
                        calc.net_profit >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      ${calc.net_profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Margin</span>
                    <Badge
                      variant={
                        calc.profit_margin >= 20 ? "default" : "secondary"
                      }
                    >
                      {calc.profit_margin}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
