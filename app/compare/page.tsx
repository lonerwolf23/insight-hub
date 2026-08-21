"use client";

import Link from "next/link";
import { Check, Hash, Sparkles } from "lucide-react";
import { useState } from "react";

import { ChartCard } from "@/components/ChartCard";
import { CompareBars } from "@/components/charts/CompareBars";
import { ScaleToggle } from "@/components/charts/ScaleToggle";
import { ReelDriverGrid } from "@/components/charts/ReelDriverGrid";
import {
  ContentMixCompare,
  ReelHashtagLeadersCompare,
  ReelTimingCompare,
} from "@/components/charts/ReelDriverExtras";
import { ProfileImage } from "@/components/ProfileImage";
import { ChartCardsSkeleton, ErrorState } from "@/components/StateScreens";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileMetrics } from "@/lib/metrics";
import { useProfiles } from "@/lib/use-profiles";
import { formatCompact, formatNumber } from "@/lib/format";
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
        if (next.size <= 1) return prev;
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };
  const selectAllAccounts = () => setSelected(new Set(allMetrics.map((m) => m.username)));

  const hasEnoughSelected = metrics.length >= 2;

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
            <p className="label-mono text-faint">Reach drivers</p>
            <Badge variant="accent">
              {metrics.length} of {allMetrics.length} selected
            </Badge>
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Why some reels{" "}
            <span className="bg-gradient-to-r from-accent via-accent-strong to-info bg-clip-text text-transparent">
              reach further
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            This isn&apos;t a ranking of which account is &quot;better&quot; — follower counts
            differ too much for that to mean anything. It&apos;s a side-by-side look at what each
            account is doing with hashtags, posting time, caption length and style, and format
            mix, so you can see which habits line up with more likes and comments on their own
            reels.
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
            const isLocked = isSelected && selected.size <= 1;
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
                      ? "At least 1 account must stay selected"
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

      {!hasEnoughSelected && (
        <div className="glass flex flex-col items-center gap-2 p-12 text-center">
          <p className="text-sm font-semibold text-foreground">Select at least 2 accounts</p>
          <p className="max-w-md text-xs leading-relaxed text-muted">
            Pick one more account above to see the reach-driver breakdown, charts, and comparison
            table.
          </p>
        </div>
      )}

      {hasEnoughSelected && (
        <>
      {/* why reels perform differently */}
      <div
        className="animate-in fade-in slide-in-from-bottom-3 space-y-4 duration-500 fill-mode-both"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="font-display text-sm font-semibold tracking-tight">
            What&apos;s driving reel reach
          </h2>
        </div>

        <ContentMixCompare metrics={metrics} hues={HUES} />

        <ReelDriverGrid
          metrics={metrics}
          hues={HUES}
          title="Hashtag count on reels"
          description="Reels bucketed by how many hashtags they carried, with each account's average engagement per bucket — shows whether tagging heavier actually correlates with more reach for that specific account."
          getBuckets={(m) => m.reelHashtagCountBuckets}
        />

        <ReelDriverGrid
          metrics={metrics}
          hues={HUES}
          title="Caption length on reels"
          description="Same idea for caption length — whether short punchy captions or long story-driven ones pull more engagement for each account."
          getBuckets={(m) => m.reelCaptionMetrics.length}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard title="Question in caption" className="lg:col-span-1">
            <BucketMini metrics={metrics} hues={HUES} buckets={(m) => m.reelCaptionMetrics.question} />
          </ChartCard>
          <ChartCard title="Call-to-action phrasing" className="lg:col-span-1">
            <BucketMini metrics={metrics} hues={HUES} buckets={(m) => m.reelCaptionMetrics.cta} />
          </ChartCard>
          <ChartCard title="Emoji use" className="lg:col-span-1">
            <BucketMini metrics={metrics} hues={HUES} buckets={(m) => m.reelCaptionMetrics.emoji} />
          </ChartCard>
        </div>

        <ReelTimingCompare metrics={metrics} hues={HUES} />

        <ReelHashtagLeadersCompare metrics={metrics} hues={HUES} />
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
        </>
      )}

      {/* footer note */}
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        <span className="h-1 w-1 rounded-full bg-accent" />
        Metrics computed from each account&apos;s scraped posts — reel-specific figures use only
        GraphVideo posts
      </p>
    </div>
  );
}

/** Compact two-or-three-bucket comparison (question / CTA / emoji) — one row per profile per bucket. */
function BucketMini({
  metrics,
  hues,
  buckets,
}: {
  metrics: ProfileMetrics[];
  hues: number[];
  buckets: (m: ProfileMetrics) => { label: string; count: number; avgEngagement: number }[];
}) {
  return (
    <div className="space-y-4">
      {metrics.map((m, i) => {
        const hue = hues[i % hues.length];
        const data = buckets(m).filter((b) => b.count > 0);
        const max = Math.max(...data.map((b) => b.avgEngagement), 1);
        const best = data.length ? data.reduce((a, b) => (b.avgEngagement > a.avgEngagement ? b : a)) : null;
        return (
          <div key={m.username}>
            <span className="font-mono text-[10px] text-faint">@{m.username}</span>
            <div className="mt-1.5 space-y-1.5">
              {data.length === 0 && <p className="text-[10px] text-faint">Not enough reels.</p>}
              {data.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-[10px] text-muted">{b.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised/60">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.max((b.avgEngagement / max) * 100, 4)}%`,
                        background: `hsl(${hue} 75% ${best && b.label === best.label ? 55 : 40}%)`,
                        opacity: best && b.label === best.label ? 1 : 0.55,
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-mono text-[9px] text-foreground">
                    {formatCompact(b.avgEngagement)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
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
