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
  DollarSign,
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => onDelete(project.id, e)}
                    disabled={deleting === project.id}
                    className="text-red-500 hover:text-red-600"
                  >
                    {deleting === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.client_name}</h3>
                    <p className="text-sm text-neutral-500">
                      {TRADE_LABELS[project.trade]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={
                        project.status === "completed" ? "outline" : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => onDelete(project.id, e)}
                      disabled={deleting === project.id}
                      className="h-7 w-7 text-red-400 hover:text-red-600"
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
          </div>
        );
      })}
    </div>
  );
}
