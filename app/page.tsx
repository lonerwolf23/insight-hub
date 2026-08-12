"use client";

import { BarChart3, Hash, Loader2 } from "lucide-react";
import { useState } from "react";

import { ChartCard } from "@/components/ChartCard";
import { CompareBars } from "@/components/charts/CompareBars";
import { ScaleToggle } from "@/components/charts/ScaleToggle";
import { ProfileCard } from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import type { ProfileMetrics } from "@/lib/metrics";
import { useProfiles } from "@/lib/use-profiles";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";

export default function DashboardPage() {
  const { data, error } = useProfiles();
  const [audienceScale, setAudienceScale] = useState<"linear" | "log">("linear");
  const [engagementScale, setEngagementScale] = useState<"linear" | "log">("log");
  const [avgScale, setAvgScale] = useState<"linear" | "log">("linear");

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="label-mono text-faint">Instagram metrics · prototype</p>
            <Badge variant="accent">Real data</Badge>
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Instagram performance overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Followers, following, posts, likes and comments from the scraped profile dump —
            evaluated with charts and tables.
          </p>
        </div>
        <div className="glass-soft flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3">
          <HeaderStat value={metrics.length} label="profiles" />
          <div className="h-8 w-px bg-line" />
          <HeaderStat value={totalAnalyzed} label="posts analyzed" />
          <div className="h-8 w-px bg-line" />
          <HeaderStat value={formatCompact(totalLikes)} label="likes" />
          <div className="h-8 w-px bg-line" />
          <HeaderStat value={formatNumber(totalComments)} label="comments" />
        </div>
      </div>

      {/* profile cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((m, i) => (
          <ProfileCard key={m.username} metrics={m} hue={i === 0 ? 250 : 200} />
        ))}
      </div>

      {/* comparison charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Audience size" description="Followers vs. accounts followed">
          <CompareBars
            data={audienceData}
            series={[
              { key: "followers", name: "Followers", color: "#7b6cff" },
              { key: "following", name: "Following", color: "#55c2f5" },
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
              { key: "likes", name: "Likes", color: "#7b6cff" },
              { key: "comments", name: "Comments", color: "#55c2f5" },
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
              { key: "avgLikes", name: "Avg likes", color: "#7b6cff" },
              { key: "avgComments", name: "Avg comments", color: "#55c2f5" },
            ]}
            scale={avgScale}
            height={220}
          />
        </ChartCard>
      </div>

      {/* comparison table */}
      <div className="glass p-5">
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
              {buildComparisonRows(metrics).map((row) => (
                <tr key={row.label} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2.5 text-xs text-muted">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={
                        "px-4 py-2.5 text-right font-mono text-xs " +
                        (row.strong ? "font-semibold text-foreground" : "text-foreground/90")
                      }
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
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

function HeaderStat({ value, label }: { value: string | number; label: string }) {
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
  strong?: boolean;
}

function buildComparisonRows(metrics: ProfileMetrics[]): Row[] {
  const rows: Row[] = [];
  const add = (label: string, fn: (m: ProfileMetrics) => string, strong = false) =>
    rows.push({ label, values: metrics.map(fn), strong });

  add("Instagram ID", (m) => `@${m.username}`, true);
  add("Full name", (m) => m.fullName);
  add("Followers", (m) => formatNumber(m.followers));
  add("Following", (m) => formatNumber(m.following));
  add("Posts (total)", (m) => formatNumber(m.totalPosts));
  add("Posts analyzed", (m) => `${formatNumber(m.analyzedPosts)} · ${m.coveragePct.toFixed(0)}% covered`);
  add("Total likes", (m) => formatNumber(m.totalLikes));
  add("Total comments", (m) => formatNumber(m.totalComments));
  add("Avg likes / post", (m) => formatNumber(m.avgLikes));
  add("Avg comments / post", (m) => formatNumber(m.avgComments));
  add("Engagement rate", (m) => `${m.engagementRate.toFixed(2)}%`, true);
  add("Likes per follower", (m) => m.likesPerFollower.toFixed(2));
  add("Unique hashtags", (m) => formatNumber(m.uniqueHashtags));
  add("Verified", (m) => (m.isVerified ? "Yes" : "No"));
  add("Business account", (m) => (m.isBusiness ? "Yes" : "No"));

  return rows;
}
