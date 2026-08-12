"use client";

import { BarChart3, Loader2, Users } from "lucide-react";

import { ProfileCard } from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { useProfiles } from "@/lib/use-profiles";

export default function ProfilesPage() {
  const { data, error } = useProfiles();

  if (error) {
    return (
      <div className="glass flex flex-col items-center gap-3 p-16 text-center">
        <BarChart3 className="h-8 w-8 text-danger" />
        <h2 className="font-display text-lg font-semibold">Failed to load profile data</h2>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass flex flex-col items-center gap-3 p-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted">Loading Instagram profile dump…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
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
              {data.metrics.reduce((s, m) => s + m.followers, 0)}
            </span>{" "}
            combined followers
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.metrics.map((m, i) => (
          <ProfileCard key={m.username} metrics={m} hue={i === 0 ? 250 : 200} />
        ))}
      </div>
    </div>
  );
}
