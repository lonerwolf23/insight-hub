"use client";

import { Users } from "lucide-react";

import { AnimatedNumber } from "@/components/CountUp";
import { ProfileCard } from "@/components/ProfileCard";
import { ErrorState, ProfileCardsSkeleton } from "@/components/StateScreens";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { useProfiles } from "@/lib/use-profiles";

export default function ProfilesPage() {
  const { data, error } = useProfiles();

  if (error) {
    return <ErrorState title="Failed to load profile data" message={error} />;
  }

  if (!data) {
    return (
      <div className="animate-in fade-in space-y-8 duration-500">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-10 w-52 rounded-2xl" />
        </div>
        <ProfileCardsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-wrap items-end justify-between gap-4 duration-500 fill-mode-both">
        <div>
          <div className="flex items-center gap-3">
            <p className="label-mono text-faint">Profiles in the dump</p>
            <Badge variant="accent">{data.profiles.length} accounts</Badge>
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Profiles</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Every Instagram account captured in{" "}
            <span className="font-mono text-foreground">all_profiles_20260812_141407.json</span>.
            Select one to open the full metric evaluation.
          </p>
        </div>
        <div className="glass-soft flex items-center gap-2 px-4 py-3 text-xs text-muted">
          <Users className="h-4 w-4 text-accent" />
          <span>
            <span className="font-mono text-foreground">
              <AnimatedNumber
                value={data.metrics.reduce((s, m) => s + m.followers, 0)}
                format={formatNumber}
              />
            </span>{" "}
            combined followers
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.metrics.map((m, i) => (
          <div
            key={m.username}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
            style={{ animationDelay: `${80 + i * 80}ms` }}
          >
            <ProfileCard metrics={m} hue={i === 0 ? 250 : 200} />
          </div>
        ))}
      </div>
    </div>
  );
}
