import { createClient } from "@/lib/supabase/server";
import { ProjectList } from "@/components/projects/project-list";
import { type Project, calculateProject } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const monthlyStats = computeMonthlyStats(projects ?? []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <MonthlySummary stats={monthlyStats} />

      <ProjectList projects={projects ?? []} />
    </div>
  );
}

function computeMonthlyStats(projects: Project[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonth = projects.filter(
    (p) => new Date(p.created_at) >= monthStart
  );

  let totalQuote = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let completedCount = 0;

  for (const p of thisMonth) {
    const calc = calculateProject(p);
    totalQuote += calc.quote_amount;
    totalCost += calc.total_cost;
    totalProfit += calc.net_profit;
    if (p.status === "completed") completedCount++;
  }

  const avgMargin =
    totalQuote > 0 ? ((totalProfit / totalQuote) * 100) : 0;

  return {
    count: thisMonth.length,
    completedCount,
    totalQuote,
    totalCost,
    totalProfit,
    avgMargin,
    monthLabel: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
  };
}

type MonthlyStats = ReturnType<typeof computeMonthlyStats>;

function MonthlySummary({ stats }: { stats: MonthlyStats }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={stats.monthLabel}
        value={stats.count.toString()}
        suffix="projects"
        sub={stats.completedCount > 0 ? `${stats.completedCount} completed` : undefined}
      />
      <StatCard
        label="Revenue"
        value={`$${stats.totalQuote.toLocaleString()}`}
        accent="default"
      />
      <StatCard
        label="Net Profit"
        value={`$${stats.totalProfit.toLocaleString()}`}
        accent={stats.totalProfit >= 0 ? "positive" : "negative"}
      />
      <StatCard
        label="Avg Margin"
        value={`${stats.avgMargin.toFixed(1)}%`}
        accent="default"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  sub,
  accent = "default",
}: {
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
  accent?: "default" | "positive" | "negative";
}) {
  const borderColor =
    accent === "positive"
      ? "border-l-emerald-500"
      : accent === "negative"
        ? "border-l-red-500"
        : "border-l-amber-500";

  return (
    <Card className="overflow-hidden border-l-2 bg-card">
      <CardContent className={`py-3 pl-4 pr-4 ${borderColor}`}>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-lg font-bold tracking-tight tabular-nums">
          {value}
          {suffix && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {suffix}
            </span>
          )}
        </p>
        {sub && <p className="mt-0.5 text-xs text-emerald-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}
