"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { Menu, Plus, LayoutDashboard } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardNav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64">
              <nav className="mt-8 flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/new"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100"
                >
                  New Project
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            ProfitScope
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Projects
              </Button>
            </Link>
            <Link href="/dashboard/new">
              <Button
                variant={pathname === "/dashboard/new" ? "secondary" : "ghost"}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-neutral-500" disabled>
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
