import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, FileText, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white to-neutral-50">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold tracking-tight">
            ProfitScope
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="https://gumroad.com" target="_blank">
              <Button>Get Started — $8/mo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Know What Every Job
          <br />
          <span className="text-blue-600">Actually Pays You</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-600 sm:text-lg">
          You quote jobs all day. But do you know your real profit after
          materials and subs? ProfitScope does the math so you can stop guessing.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="https://gumroad.com" target="_blank">
            <Button size="lg" className="w-full px-8 sm:w-auto">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Calculator className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle>Auto-Calculate Quotes</CardTitle>
              <CardDescription>
                Pick your trade, set hours × rate. Your quote is ready.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="mb-2 h-8 w-8 text-emerald-600" />
              <CardTitle>Real Profit Numbers</CardTitle>
              <CardDescription>
                Material + sub costs deducted. See your margin instantly.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="mb-2 h-8 w-8 text-purple-600" />
              <CardTitle>Professional PDF Quotes</CardTitle>
              <CardDescription>
                Export clean quotes your clients will trust.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">One Simple Plan</h2>
        <p className="mt-2 text-neutral-600">
          No tiers. No hidden fees. Just profit clarity.
        </p>
        <Card className="mx-auto mt-8 max-w-sm">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold">$8</div>
            <div className="text-neutral-500">per month</div>
            <ul className="mt-6 space-y-2 text-left text-sm text-neutral-600">
              <li>✓ Unlimited projects</li>
              <li>✓ Profit calculations</li>
              <li>✓ PDF quote exports</li>
              <li>✓ Mobile-friendly</li>
            </ul>
            <Link href="https://gumroad.com" target="_blank" className="mt-6 block">
              <Button className="w-full">Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} ProfitScope. Built for contractors.
      </footer>
    </div>
  );
}
