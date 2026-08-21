"use client";

import { ProfileImage } from "@/components/ProfileImage";
import type { ProfileMetrics } from "@/lib/metrics";
import { formatCompact, formatPercent } from "@/lib/format";

interface CompareProps {
  metrics: ProfileMetrics[];
  hues: number[];
}

function ColumnHeader({ metrics, hue }: { metrics: ProfileMetrics; hue: number }) {
  return (
    <div className="flex items-center gap-2">
      <ProfileImage src={metrics.profilePicUrl} name={metrics.fullName} size={22} hue={hue} />
      <span className="truncate font-mono text-[11px] text-muted">@{metrics.username}</span>
    </div>
  );
}

function grid(n: number) {
  return { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
}

/** How much of each account's feed is reels, and whether reels actually out-engage their other formats. */
export function ContentMixCompare({ metrics, hues }: CompareProps) {
  return (
    <div className="glass p-5">
      <h3 className="font-display text-sm font-semibold tracking-tight">Format mix</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Share of each account&apos;s analyzed posts that are reels, and how reel engagement
        compares to their other formats (images/carousels) on the same account.
      </p>
      <div className="mt-4 grid gap-6" style={grid(metrics.length)}>
        {metrics.map((m, i) => {
          const hue = hues[i % hues.length];
          const maxEng = Math.max(m.avgReelEngagement, m.avgNonReelEngagement, 1);
          return (
            <div key={m.username} className="min-w-0">
              <ColumnHeader metrics={m} hue={hue} />
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Reels are of feed</span>
                  <span className="font-mono text-foreground">
                    {formatPercent(m.reelSharePct, 0)}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-raised/60">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max(m.reelSharePct, 2)}%`,
                      background: `hsl(${hue} 75% 55%)`,
                    }}
                  />
                </div>
                <span className="mt-0.5 block text-[10px] text-faint">
                  {m.reelCount} reels · {m.nonReelCount} other
                </span>
              </div>
              <div className="mt-4 space-y-1.5">
                <BarRow
                  label="Reels avg engagement"
                  value={m.avgReelEngagement}
                  max={maxEng}
                  hue={hue}
                  strong
                />
                <BarRow
                  label="Other formats avg"
                  value={m.avgNonReelEngagement}
                  max={maxEng}
                  hue={hue}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  hue,
  strong,
}: {
  label: string;
  value: number;
  max: number;
  hue: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-32 shrink-0 truncate text-[10px] text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-raised/60">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${Math.max((value / max) * 100, 3)}%`,
            background: `hsl(${hue} 75% ${strong ? 55 : 40}%)`,
            opacity: strong ? 1 : 0.55,
          }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-[10px] text-foreground">
        {formatCompact(value)}
      </span>
    </div>
  );
}

/** When each account's reels actually land best — a factual reading, not a "copy the leader" prompt. */
export function ReelTimingCompare({ metrics, hues }: CompareProps) {
  return (
    <div className="glass p-5">
      <h3 className="font-display text-sm font-semibold tracking-tight">Reel posting time</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Each account&apos;s own best day and hour for reels, by average engagement — where their
        history has enough posts in that slot to mean something.
      </p>
      <div className="mt-4 grid gap-4" style={grid(metrics.length)}>
        {metrics.map((m, i) => {
          const hue = hues[i % hues.length];
          return (
            <div key={m.username} className="min-w-0 rounded-xl border border-line bg-raised/20 p-3">
              <ColumnHeader metrics={m} hue={hue} />
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Best day</span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {m.bestReelDay ? m.bestReelDay.label : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Best hour</span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {m.bestReelHour ? m.bestReelHour.label : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Peak-hour avg engagement</span>
                  <span className="font-mono text-xs text-foreground">
                    {m.bestReelHour ? formatCompact(m.bestReelHour.avgEngagement) : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Hashtags that actually correlate with higher reel engagement (min. 3 uses), vs. the ones just used every time. */
export function ReelHashtagLeadersCompare({ metrics, hues }: CompareProps) {
  return (
    <div className="glass p-5">
      <h3 className="font-display text-sm font-semibold tracking-tight">
        Hashtags on reels: used often vs. actually performing
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Left column of each account is its most-repeated tags (often branding/handles). Right
        column is tags used 3+ times with the highest average engagement — a proxy for which
        topics resonated, since Instagram&apos;s dump has no separate topic field.
      </p>
      <div className="mt-4 grid gap-6" style={grid(metrics.length)}>
        {metrics.map((m, i) => {
          const hue = hues[i % hues.length];
          return (
            <div key={m.username} className="min-w-0">
              <ColumnHeader metrics={m} hue={hue} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="label-mono mb-1.5 text-faint">Most used</p>
                  <ul className="space-y-1">
                    {m.reelTopHashtags.slice(0, 5).map((h) => (
                      <li key={h.tag} className="flex items-center justify-between gap-1.5">
                        <span className="truncate font-mono text-[10px] text-muted" title={h.tag}>
                          #{h.tag}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] text-faint">
                          {h.count}×
                        </span>
                      </li>
                    ))}
                    {m.reelTopHashtags.length === 0 && (
                      <li className="text-[10px] text-faint">No hashtags on reels.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="label-mono mb-1.5 text-faint">Best performing</p>
                  <ul className="space-y-1">
                    {m.reelHashtagEffectiveness.slice(0, 5).map((h) => (
                      <li key={h.tag} className="flex items-center justify-between gap-1.5">
                        <span
                          className="truncate font-mono text-[10px] text-foreground"
                          title={h.tag}
                        >
                          #{h.tag}
                        </span>
                        <span
                          className="shrink-0 font-mono text-[9px]"
                          style={{ color: `hsl(${hue} 75% 60%)` }}
                        >
                          {formatCompact(h.avgEngagement ?? 0)}
                        </span>
                      </li>
                    ))}
                    {m.reelHashtagEffectiveness.length === 0 && (
                      <li className="text-[10px] text-faint">Not enough repeat tags yet.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
