"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Project, calculateProject, TRADE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
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
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "table" | "cards";

export function ProjectList({ projects: initialProjects }: { projects: Project[] }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [projects, setProjects] = useState(initialProjects);
  const [deleting, setDeleting] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!supabase) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;

    setDeleting(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
      setDeleting(null);
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
      setDeleting(null);
      router.refresh();
    }
  };

  if (projects.length === 0) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <h3 className="text-base font-medium">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start tracking profits.
          </p>
          <Link href="/dashboard/new" className="mt-4">
            <Button size="sm">Create Project</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="mb-3 flex justify-end gap-0.5">
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("table")}
          className="h-8 w-8"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "cards" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("cards")}
          className="h-8 w-8"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {viewMode === "table" ? (
        <ProjectTable projects={projects} onDelete={handleDelete} deleting={deleting} />
      ) : (
        <ProjectCards projects={projects} onDelete={handleDelete} deleting={deleting} />
      )}
    </div>
  );
}

function ProjectTable({
  projects,
  onDelete,
  deleting,
}: {
  projects: Project[];
  onDelete: (id: string, e: React.MouseEvent) => void;
  deleting: string | null;
}) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-medium text-muted-foreground">Client</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Trade</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Quote</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Cost</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Profit</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Margin</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="w-8" />
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const calc = calculateProject(project);
            return (
              <TableRow key={project.id} className="border-border">
                <TableCell className="py-2.5 text-sm font-medium">
                  {project.client_name}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {TRADE_LABELS[project.trade]}
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm tabular-nums">
                  ${calc.quote_amount.toLocaleString()}
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm tabular-nums text-muted-foreground">
                  ${calc.total_cost.toLocaleString()}
                </TableCell>
                <TableCell
                  className={`py-2.5 text-right text-sm font-medium tabular-nums ${
                    calc.net_profit >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  ${calc.net_profit.toLocaleString()}
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm">
                  <Badge
                    variant={calc.profit_margin >= 20 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {calc.profit_margin}%
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5 text-sm">
                  <Badge
                    variant={
                      project.status === "completed" ? "outline" : "secondary"
                    }
                    className="text-xs"
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  <Link href={`/dashboard/${project.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="py-2.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => onDelete(project.id, e)}
                    disabled={deleting === project.id}
                    className="h-7 w-7 text-red-500 hover:text-red-400"
                  >
                    {deleting === project.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectCards({
  projects,
  onDelete,
  deleting,
}: {
  projects: Project[];
  onDelete: (id: string, e: React.MouseEvent) => void;
  deleting: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const calc = calculateProject(project);
        return (
          <div
            key={project.id}
            onClick={() => window.location.assign(`/dashboard/${project.id}`)}
            className="cursor-pointer"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") window.location.assign(`/dashboard/${project.id}`);
            }}
          >
            <Card className="border-border bg-card transition-colors hover:border-amber-500/30">
              <CardContent className="pt-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{project.client_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {TRADE_LABELS[project.trade]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={
                        project.status === "completed" ? "outline" : "secondary"
                      }
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => onDelete(project.id, e)}
                      disabled={deleting === project.id}
                      className="h-7 w-7 text-red-500 hover:text-red-400"
                    >
                      {deleting === project.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quote</span>
                    <span className="font-medium tabular-nums">
                      ${calc.quote_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="tabular-nums">${calc.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1">
                    <span className="font-medium text-xs">Profit</span>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        calc.net_profit >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      ${calc.net_profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin</span>
                    <Badge
                      variant={
                        calc.profit_margin >= 20 ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {calc.profit_margin}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
