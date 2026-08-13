"use client";

import { CalendarClock, Clapperboard, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { GLOBAL_POST_WINDOWS, GLOBAL_REEL_TIMES } from "@/data/global-best-times";
import { formatHour12 } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Date#getDay() is 0=Sun..6=Sat; the table reads Monday-first, so shift it.
function mondayFirstIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function reelTimesFor(day: string): string {
  return GLOBAL_REEL_TIMES.filter((p) => p.day === day)
    .map((p) => formatHour12(p.hour))
    .join(" · ");
}

function postWindowFor(day: string) {
  return GLOBAL_POST_WINDOWS.find((w) => w.day === day)!;
}

export function PostingRecommendation() {
  const [todayIndex, setTodayIndex] = useState<number | null>(null);

  useEffect(() => {
    setTodayIndex(mondayFirstIndex(new Date().getDay()));
  }, []);

  return (
    <div className="glass p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <CalendarClock className="h-4 w-4 text-accent" />
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Recommended posting time
        </h3>
        <span className="label-mono ml-auto text-faint">global Instagram data, by weekday</span>
      </div>
      <p className="mb-4 max-w-3xl text-xs leading-relaxed text-muted">
        Sourced from published cross-account Instagram research, not this account&apos;s own post
        history.
        {todayIndex != null && (
          <>
            {" "}
            Today is{" "}
            <span className="font-semibold text-foreground">{DAY_FULL[todayIndex]}</span> — see
            the highlighted row.
          </>
        )}
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-raised/30 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              <th className="px-3 py-2.5 font-semibold">Day</th>
              <th className="px-3 py-2.5 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Clapperboard className="h-3 w-3" />
                  Reels
                </span>
              </th>
              <th className="px-3 py-2.5 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3" />
                  Posts
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => {
              const isToday = todayIndex === i;
              const window = postWindowFor(day);
              return (
                <tr
                  key={day}
                  className={cn(
                    "border-b border-line/60 last:border-0",
                    isToday && "bg-accent-soft/50",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-display text-sm font-semibold tracking-tight",
                          isToday ? "text-accent-strong" : "text-foreground",
                        )}
                      >
                        {DAY_FULL[i]}
                      </span>
                      {isToday && (
                        <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-accent-strong">
                          Today
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-foreground">
                    {reelTimesFor(day)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">
                    {window.start != null ? (
                      <span className="text-foreground">{window.note}</span>
                    ) : (
                      <span className="text-faint">{window.note}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
