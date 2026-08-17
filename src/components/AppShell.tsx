"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Radar, Users } from "lucide-react";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/profiles", label: "Profiles", icon: Users, end: false },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
        <Radar className="h-5 w-5 text-white" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-semibold tracking-tight">Insight Hub</p>
        <p className="label-mono text-faint">Instagram metrics</p>
      </div>
    </div>
  );
}

function NavItems() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            href={item.to}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent-soft text-foreground shadow-[inset_0_0_0_1px_var(--line)]"
                : "text-muted hover:bg-raised/50 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DataStatus() {
  return (
    <div className="glass-soft flex flex-col gap-2.5 p-3.5">
      <div className="flex items-center justify-between">
        <span className="label-mono text-faint">Data source</span>
        <span className="rounded-full border border-good/30 bg-good/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-good">
          Real
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Instagram profile dump
        </span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-8 border-r border-line bg-surface px-5 py-6 lg:flex">
        <Brand />
        <NavItems />
        <div className="flex-1" />
        <DataStatus />
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="label-mono text-faint">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* top bar — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-5 py-3 lg:hidden">
        <Brand />
        <ThemeToggle />
      </header>
      <div className="border-b border-line bg-surface px-5 py-2 lg:hidden">
        <NavItems />
      </div>

      {/* main */}
      <main className="relative z-10 lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
