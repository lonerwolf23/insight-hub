"use client";

import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import type { ReactNode } from "react";

import { AnimatedNumber } from "@/components/CountUp";
import { ProfileCard } from "@/components/ProfileCard";
import { ChartCardsSkeleton, ErrorState, ProfileCardsSkeleton } from "@/components/StateScreens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfiles } from "@/lib/use-profiles";
import { formatCompact, formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const { data, error } = useProfiles();

  if (error) {
    return (
      <ErrorState title="Failed to load profile data" message={error} />
    );
  }

  if (!data) {
    return (
      <div className="animate-in fade-in space-y-8 duration-500">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-9 w-96 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-16 w-80 max-w-full rounded-2xl" />
        </div>
        <ProfileCardsSkeleton />
        <ChartCardsSkeleton />
      </div>
    );
  }

  const { metrics } = data;
  const totalAnalyzed = metrics.reduce((s, m) => s + m.analyzedPosts, 0);
  const totalLikes = metrics.reduce((s, m) => s + m.totalLikes, 0);
  const totalComments = metrics.reduce((s, m) => s + m.totalComments, 0);

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-wrap items-end justify-between gap-4 duration-500 fill-mode-both">
        <div>
          <div className="flex items-center gap-3">
            <p className="label-mono text-faint">Instagram metrics · prototype</p>
            <Badge variant="accent">Real data</Badge>
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Instagram{" "}
            <span className="bg-gradient-to-r from-accent via-accent-strong to-info bg-clip-text text-transparent">
              performance overview
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Followers, following, posts, likes and comments from the scraped profile dump —
            evaluated with charts and tables.
          </p>
        </div>
        <div className="glass-soft flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3">
          <HeaderStat value={metrics.length} label="profiles" />
          <div className="h-8 w-px bg-line" />
          <HeaderStat value={<AnimatedNumber value={totalAnalyzed} format={formatNumber} />} label="posts analyzed" />
          <div className="h-8 w-px bg-line" />
          <HeaderStat value={<AnimatedNumber value={totalLikes} format={formatCompact} />} label="likes" />
          <div className="h-8 w-px bg-line" />
          <HeaderStat value={<AnimatedNumber value={totalComments} format={formatNumber} />} label="comments" />
        </div>
      </div>

      {/* profile cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((m, i) => (
          <div
            key={m.username}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
            style={{ animationDelay: `${80 + i * 80}ms` }}
          >
            <ProfileCard metrics={m} hue={i === 0 ? 250 : 200} />
          </div>
        ))}
      </div>

      {/* compare teaser */}
      <div
        className="glass animate-in fade-in slide-in-from-bottom-3 flex flex-wrap items-center justify-between gap-4 p-5 duration-500 fill-mode-both"
        style={{ animationDelay: "160ms" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Compare accounts head-to-head
            </h3>
            <p className="text-xs text-muted">
              Audience, engagement, and rate-based leaderboards across all {metrics.length} accounts.
            </p>
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href="/compare">
            Open comparison
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* footer note */}
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        <span className="h-1 w-1 rounded-full bg-accent" />
        Metrics computed from the scraped posts in all_profiles_20260812_141407.json
      </p>
    </div>
  );
}

function HeaderStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold tracking-tight">{value}</p>
      <p className="label-mono text-faint">{label}</p>
    </div>
  );
}
