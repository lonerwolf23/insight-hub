"use client";

import Link from "next/link";
import { Check, Crown, Hash } from "lucide-react";
import { useState } from "react";

import { ChartCard } from "@/components/ChartCard";
import { CompareBars } from "@/components/charts/CompareBars";
import { ScaleToggle } from "@/components/charts/ScaleToggle";
import { ProfileImage } from "@/components/ProfileImage";
import { ChartCardsSkeleton, ErrorState } from "@/components/StateScreens";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileMetrics } from "@/lib/metrics";
import { useProfiles } from "@/lib/use-profiles";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import { profileSlug } from "@/lib/slugs";
import { cn } from "@/lib/utils";

const HUES = [250, 200, 150];

export default function ComparePage() {
  const { data, error } = useProfiles();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(data.metrics.map((m) => m.username)),
  );
  const [audienceScale, setAudienceScale] = useState<"linear" | "log">("linear");
  const [engagementScale, setEngagementScale] = useState<"linear" | "log">("log");
  const [avgScale, setAvgScale] = useState<"linear" | "log">("linear");

  if (error) {
    return <ErrorState title="Failed to load profile data" message={error} />;
  }

  if (!data) {
    return (
      <div className="animate-in fade-in space-y-8 duration-500">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-96 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <ChartCardsSkeleton />
      </div>
    );
  }

  const allMetrics = data.metrics;
  const metrics = allMetrics.filter((m) => selected.has(m.username));

  const toggleAccount = (username: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        if (next.size <= 2) return prev;
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };
  const selectAllAccounts = () => setSelected(new Set(allMetrics.map((m) => m.username)));

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
            <p className="label-mono text-faint">Head-to-head</p>
            <Badge variant="accent">
              {metrics.length} of {allMetrics.length} selected
            </Badge>
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Account{" "}
            <span className="bg-gradient-to-r from-accent via-accent-strong to-info bg-clip-text text-transparent">
              comparison
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Pick any 2 or 3 accounts below to compare head-to-head. Raw totals favor whoever has
            the biggest audience — the leaderboards below rank by rate instead, so a smaller
            account can still come out on top.
          </p>
        </div>
      </div>

      {/* account picker */}
      <div
        className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
        style={{ animationDelay: "80ms" }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="label-mono text-faint">Choose accounts to compare</p>
          {selected.size < allMetrics.length && (
            <button
              type="button"
              onClick={selectAllAccounts}
              className="label-mono text-faint transition-colors hover:text-accent"
            >
              Select all {allMetrics.length}
            </button>
          )}
        </div>
        <div className="glass flex flex-wrap items-center gap-2 p-3">
          {allMetrics.map((m, i) => {
            const isSelected = selected.has(m.username);
            const isLocked = isSelected && selected.size <= 2;
            return (
              <div
                key={m.username}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-2 py-1.5 pr-3 transition-colors",
                  isSelected
                    ? "border-accent/30 bg-accent-soft/40"
                    : "border-transparent opacity-60 hover:opacity-90 hover:bg-raised/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAccount(m.username)}
                  disabled={isLocked}
                  aria-pressed={isSelected}
                  title={
                    isLocked
                      ? "At least 2 accounts must stay selected"
                      : isSelected
                        ? "Remove from comparison"
                        : "Add to comparison"
                  }
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-line-strong hover:border-accent/60",
                    isLocked && "cursor-not-allowed opacity-70",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                </button>
                <Link
                  href={`/profiles/${profileSlug(m.username)}`}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-raised/50"
                >
                  <ProfileImage
                    src={m.profilePicUrl}
                    name={m.fullName}
                    size={34}
                    hue={HUES[i % HUES.length]}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{m.fullName}</p>
                    <p className="font-mono text-[11px] text-faint">@{m.username}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* rate-based leaderboards */}
      <div
        className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Crown className="h-4 w-4 text-accent" />
          <h2 className="font-display text-sm font-semibold tracking-tight">
            Who&apos;s leading, metric by metric
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Leaderboard
            title="Followers"
            metrics={metrics}
            value={(m) => m.followers}
            format={formatCompact}
          />
          <Leaderboard
            title="Engagement rate"
            metrics={metrics}
            value={(m) => m.engagementRate}
            format={(v) => formatPercent(v, 2)}
          />
          <Leaderboard
            title="Avg likes / post"
            metrics={metrics}
            value={(m) => m.avgLikes}
            format={formatCompact}
          />
          <Leaderboard
            title="Avg comments / post"
            metrics={metrics}
            value={(m) => m.avgComments}
            format={formatCompact}
          />
          <Leaderboard
            title="Likes per follower"
            metrics={metrics}
            value={(m) => m.likesPerFollower}
            format={(v) => v.toFixed(2)}
          />
          <Leaderboard
            title="Unique hashtags used"
            metrics={metrics}
            value={(m) => m.uniqueHashtags}
            format={formatNumber}
          />
        </div>
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
                                  background: `hsl(${HUES[i % HUES.length]} 75% 60%)`,
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

function Leaderboard({
  title,
  metrics,
  value,
  format,
}: {
  title: string;
  metrics: ProfileMetrics[];
  value: (m: ProfileMetrics) => number;
  format: (v: number) => string;
}) {
  const ranked = metrics
    .map((m) => ({ m, v: value(m) }))
    .sort((a, b) => b.v - a.v);
  const max = ranked[0]?.v || 1;

  return (
    <div className="glass p-4">
      <p className="label-mono mb-3 text-faint">{title}</p>
      <div className="space-y-2.5">
        {ranked.map(({ m, v }, i) => (
          <div key={m.username} className="flex items-center gap-2.5">
            {i === 0 ? (
              <Crown className="h-3.5 w-3.5 shrink-0 text-warn" />
            ) : (
              <span className="w-3.5 shrink-0 text-center font-mono text-[10px] text-faint">
                {i + 1}
              </span>
            )}
            <span className="w-24 shrink-0 truncate font-mono text-[11px] text-muted" title={`@${m.username}`}>
              @{m.username}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised/60">
              <span
                className="block h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(4, (v / max) * 100)}%`,
                  background: `hsl(${HUES[i % HUES.length]} 75% 55%)`,
                }}
              />
            </span>
            <span
              className={cn(
                "w-16 shrink-0 text-right font-mono text-xs",
                i === 0 ? "font-semibold text-foreground" : "text-muted",
              )}
            >
              {format(v)}
            </span>
          </div>
        ))}
      </div>
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
