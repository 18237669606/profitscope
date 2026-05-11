import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold tracking-tight text-white">
            ProfitScope
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="https://gumroad.com" target="_blank">
              <Button size="sm">Get Started — $12/mo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-900 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Know what every job
            <br />
            <span className="text-amber-500">actually pays you.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Quote the job. Track your costs. See your real profit. The tool
            built for contractors who want to stop guessing and start earning.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="https://gumroad.com" target="_blank">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Three steps. One number that matters.
          </h2>

          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            <Step
              num="1"
              title="Enter the job"
              description="Client name, trade, hourly rate, estimated hours. Your quote is calculated instantly."
            />
            <Step
              num="2"
              title="Track your costs"
              description="Log material expenses and subcontractor costs as they come in. No spreadsheets."
            />
            <Step
              num="3"
              title="See your profit"
              description="Net profit and margin, updated live. Export a PDF report for your records or your client."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-xl font-bold tracking-tight">
            $12<span className="text-slate-400 font-normal">/month</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            $10/mo billed annually. No tiers, no hidden fees. Unlimited projects.
          </p>
          <div className="mt-6">
            <Link href="https://gumroad.com" target="_blank">
              <Button size="lg" className="px-10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} ProfitScope. Built for contractors.
      </footer>
    </div>
  );
}

function Step({
  num,
  title,
  description,
}: {
  num: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-900 text-xs font-bold text-amber-500">
        {num}
      </div>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
