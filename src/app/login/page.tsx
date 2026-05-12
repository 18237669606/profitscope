"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useAuth } from "@/components/auth-provider";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInWithMagicLink } = useAuth();
  const searchParams = useSearchParams();
  const subscribed = searchParams.get("subscribed");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signInWithMagicLink(email);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      {/* Nav */}
      <header className="border-b border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
          <Link href="/" className="text-base font-bold tracking-tight text-white">
            ProfitScope
          </Link>
        </div>
      </header>

      {subscribed === "true" && (
        <div className="mx-auto mt-4 max-w-md rounded-md bg-emerald-900/50 px-4 py-3 text-center text-sm font-medium text-emerald-300">
          Subscription successful! Sign in below to access your account.
        </div>
      )}

      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800 text-white">
          <CardHeader className="text-center">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <CardTitle className="text-xl">Sign In to ProfitScope</CardTitle>
            <CardDescription className="text-slate-400">
              No password needed. We&apos;ll email you a magic link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-3">
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-slate-400">
                  We sent a magic link to{" "}
                  <span className="font-medium text-slate-200">{email}</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Magic Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
