import { AuthProvider } from "@/components/auth-provider";
import { DashboardNav } from "@/components/dashboard-nav";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-50">
        <DashboardNav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
