"use client";

import { Hash } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { AnimatedNumber } from "@/components/CountUp";
import { ChartCard } from "@/components/ChartCard";
import { CompareBars } from "@/components/charts/CompareBars";
import { ScaleToggle } from "@/components/charts/ScaleToggle";
import { ProfileCard } from "@/components/ProfileCard";
import { ChartCardsSkeleton, ErrorState, ProfileCardsSkeleton } from "@/components/StateScreens";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileMetrics } from "@/lib/metrics";
import { useProfiles } from "@/lib/use-profiles";
import { formatCompact, formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const { data, error } = useProfiles();
  const [audienceScale, setAudienceScale] = useState<"linear" | "log">("linear");
  const [engagementScale, setEngagementScale] = useState<"linear" | "log">("log");
  const [avgScale, setAvgScale] = useState<"linear" | "log">("linear");

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

  const audienceData = metrics.map((m) => ({
    label: `@${m.username}`,
    followers: m.followers,
    following: m.following,
  }));
  const engagementData = metrics.map((m) => ({
    label: `@${m.username}`,
    likes: m.totalLikes,
    comments: m.totalComments,
  }));
  const avgData = metrics.map((m) => ({
    label: `@${m.username}`,
    avgLikes: m.avgLikes,
    avgComments: m.avgComments,
  }));

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

      {/* comparison charts */}
      <div
        className="animate-in fade-in slide-in-from-bottom-3 grid gap-4 duration-500 fill-mode-both lg:grid-cols-3"
        style={{ animationDelay: "160ms" }}
      >
        <ChartCard title="Audience size" description="Followers vs. accounts followed">
          <CompareBars
            data={audienceData}
            series={[
              { key: "followers", name: "Followers", color: "#0d99ff" },
              { key: "following", name: "Following", color: "#9747ff" },
            ]}
            scale={audienceScale}
            height={220}
          />
        </ChartCard>

        <ChartCard
          title="Engagement totals"
          description="Likes and comments across analyzed posts"
          headerSlot={<ScaleToggle value={engagementScale} onChange={setEngagementScale} />}
        >
          <CompareBars
            data={engagementData}
            series={[
              { key: "likes", name: "Likes", color: "#0d99ff" },
              { key: "comments", name: "Comments", color: "#9747ff" },
            ]}
            scale={engagementScale}
            height={220}
          />
        </ChartCard>

        <ChartCard
          title="Average per post"
          description="Mean likes and comments per analyzed post"
          headerSlot={<ScaleToggle value={avgScale} onChange={setAvgScale} />}
        >
          <CompareBars
            data={avgData}
            series={[
              { key: "avgLikes", name: "Avg likes", color: "#0d99ff" },
              { key: "avgComments", name: "Avg comments", color: "#9747ff" },
            ]}
            scale={avgScale}
            height={220}
          />
        </ChartCard>
      </div>

      {/* comparison table */}
      <div
        className="glass animate-in fade-in slide-in-from-bottom-3 p-5 duration-500 fill-mode-both"
        style={{ animationDelay: "220ms" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Hash className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm font-semibold tracking-tight">
            Metric comparison table
          </h3>
          <span className="label-mono ml-auto text-faint">all values from the profile dump</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-raised/30 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                <th className="px-4 py-3 font-semibold">Metric</th>
                {metrics.map((m) => (
                  <th key={m.username} className="px-4 py-3 text-right font-semibold">
                    @{m.username}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buildComparisonRows(metrics).map((row) => {
                const maxRaw = row.raw ? Math.max(...row.raw, 1) : 0;
                return (
                  <tr key={row.label} className="group/row border-b border-line/60 last:border-0">
                    <td className="px-4 py-2.5 text-xs text-muted">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-2.5 text-right font-mono text-xs">
                        <div className="flex items-center justify-end gap-2">
                          {row.raw && (
                            <span className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-raised/60">
                              <span
                                className="block h-full rounded-full transition-all duration-500 group-hover/row:brightness-125"
                                style={{
                                  width: `${Math.max(6, (row.raw[i] / maxRaw) * 100)}%`,
                                  background: `hsl(${i === 0 ? 250 : 200} 75% 60%)`,
                                }}
                              />
                            </span>
                          )}
                          <span
                            className={
                              row.strong ? "font-semibold text-foreground" : "text-foreground/90"
                            }
                          >
                            {v}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

interface Row {
  label: string;
  values: string[];
  raw?: number[];
  strong?: boolean;
}

function buildComparisonRows(metrics: ProfileMetrics[]): Row[] {
  const rows: Row[] = [];
  const add = (
    label: string,
    fn: (m: ProfileMetrics) => string,
    opts: { strong?: boolean; raw?: (m: ProfileMetrics) => number } = {},
  ) =>
    rows.push({
      label,
      values: metrics.map(fn),
      raw: opts.raw ? metrics.map(opts.raw) : undefined,
      strong: opts.strong,
    });

  add("Instagram ID", (m) => `@${m.username}`, { strong: true });
  add("Full name", (m) => m.fullName);
  add("Followers", (m) => formatNumber(m.followers), { raw: (m) => m.followers });
  add("Following", (m) => formatNumber(m.following), { raw: (m) => m.following });
  add("Posts (total)", (m) => formatNumber(m.totalPosts), { raw: (m) => m.totalPosts });
  add("Posts analyzed", (m) => `${formatNumber(m.analyzedPosts)} · ${m.coveragePct.toFixed(0)}% covered`);
  add("Total likes", (m) => formatNumber(m.totalLikes), { raw: (m) => m.totalLikes });
  add("Total comments", (m) => formatNumber(m.totalComments), { raw: (m) => m.totalComments });
  add("Avg likes / post", (m) => formatNumber(m.avgLikes), { raw: (m) => m.avgLikes });
  add("Avg comments / post", (m) => formatNumber(m.avgComments), { raw: (m) => m.avgComments });
  add("Engagement rate", (m) => `${m.engagementRate.toFixed(2)}%`, {
    strong: true,
    raw: (m) => m.engagementRate,
  });
  add("Likes per follower", (m) => m.likesPerFollower.toFixed(2), { raw: (m) => m.likesPerFollower });
  add("Unique hashtags", (m) => formatNumber(m.uniqueHashtags), { raw: (m) => m.uniqueHashtags });
  add("Verified", (m) => (m.isVerified ? "Yes" : "No"));
  add("Business account", (m) => (m.isBusiness ? "Yes" : "No"));

  return rows;
}
