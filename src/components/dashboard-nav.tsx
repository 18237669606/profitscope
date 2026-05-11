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
import { Menu, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardNav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
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
                  href="/"
                  className="rounded px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/new"
                  className="rounded px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  New Project
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-base font-bold tracking-tight text-foreground">
            ProfitScope
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-0.5">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
              >
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
              >
                Projects
              </Button>
            </Link>
            <Link href="/dashboard/new">
              <Button
                variant={pathname === "/dashboard/new" ? "secondary" : "ghost"}
                size="sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
