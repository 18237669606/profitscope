import { createClient } from "@/lib/supabase/server";
import { ProjectList } from "@/components/projects/project-list";
import { type Project, calculateProject } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, DollarSign, TrendingUp, Percent, Briefcase, Crown } from "lucide-react";

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-neutral-500">
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Monthly summary */}
      <MonthlySummary stats={monthlyStats} />

      {/* Subscription status */}
      <SubscriptionBanner />

      <ProjectList projects={projects ?? []} />

      {/* Footer */}
      <footer className="mt-12 border-t pt-6 text-center text-xs text-neutral-400">
        Built for contractors who want to know their real profit.
      </footer>
    </div>
  );
}

function SubscriptionBanner() {
  return (
    <Card className="mb-6 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <Crown className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Pro Plan</p>
            <p className="text-xs text-neutral-500">$8/month</p>
          </div>
        </div>
        <Link
          href="https://gumroad.com"
          target="_blank"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Manage Subscription &rarr;
        </Link>
      </CardContent>
    </Card>
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
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{stats.monthLabel}</p>
            <p className="text-xl font-bold">
              {stats.count}{" "}
              <span className="text-sm font-normal text-neutral-400">
                projects
              </span>
            </p>
            {stats.completedCount > 0 && (
              <p className="text-xs text-emerald-600">
                {stats.completedCount} completed
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Revenue</p>
            <p className="text-xl font-bold">
              ${stats.totalQuote.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Net Profit</p>
            <p
              className={`text-xl font-bold ${
                stats.totalProfit >= 0 ? "text-emerald-700" : "text-red-500"
              }`}
            >
              ${stats.totalProfit.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Avg Margin</p>
            <p className="text-xl font-bold">
              {stats.avgMargin.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
