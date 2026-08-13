/**
 * Cross-account "when does Instagram engage" benchmarks — published third-party
 * research, not derived from this app's own scraped profile data. Kept separate
 * from src/lib/metrics.ts (which computes per-account history) so the two are
 * never conflated: this is what happens industry-wide, not what happened to
 * @drmoksha.advocate specifically.
 *
 * Sources (fetched August 2026):
 * - Reels: SocialPilot — "Best Time to Post Reels on Instagram in 2026", ~250K
 *   Reels published across 30K+ connected accounts.
 *   https://www.socialpilot.co/insights/best-time-to-post-reels-on-instagram
 * - Posts: Sprout Social — "Best Times to Post on Instagram in 2026", ~2B
 *   engagements across 307K profiles (Nov 2025–Feb 2026 window).
 *   https://sproutsocial.com/insights/best-times-to-post-on-instagram/
 */

export interface GlobalReelPoint {
  day: string;
  hour: number;
}

// SocialPilot's named peak hours per day, in Instagram-reported local time.
export const GLOBAL_REEL_TIMES: GlobalReelPoint[] = [
  { day: "Mon", hour: 3 },
  { day: "Mon", hour: 11 },
  { day: "Mon", hour: 12 },
  { day: "Tue", hour: 8 },
  { day: "Tue", hour: 9 },
  { day: "Tue", hour: 10 },
  { day: "Wed", hour: 9 },
  { day: "Wed", hour: 11 },
  { day: "Wed", hour: 13 },
  { day: "Thu", hour: 6 },
  { day: "Thu", hour: 11 },
  { day: "Thu", hour: 12 },
  { day: "Fri", hour: 11 },
  { day: "Fri", hour: 14 },
  { day: "Fri", hour: 16 },
  { day: "Sat", hour: 9 },
  { day: "Sat", hour: 10 },
  { day: "Sat", hour: 17 },
  { day: "Sun", hour: 5 },
  { day: "Sun", hour: 13 },
  { day: "Sun", hour: 14 },
];

export interface GlobalPostWindow {
  day: string;
  start: number | null;
  duration: number | null;
  note: string;
}

// Sprout Social's stated engagement window per day. Days with no stated window
// (start/duration null) render as an empty row — that absence is itself the
// finding (Sprout calls these "no significant peak" / the weakest days).
export const GLOBAL_POST_WINDOWS: GlobalPostWindow[] = [
  { day: "Mon", start: 14, duration: 2, note: "2 PM – 4 PM" },
  { day: "Tue", start: 13, duration: 6, note: "1 PM – 7 PM" },
  { day: "Wed", start: 12, duration: 9, note: "12 PM – 9 PM, plus an 11 PM spike" },
  { day: "Thu", start: 12, duration: 2, note: "12 PM – 2 PM" },
  { day: "Fri", start: null, duration: null, note: "no significant peak" },
  { day: "Sat", start: null, duration: null, note: "lowest engagement of the week" },
  { day: "Sun", start: null, duration: null, note: "weakest day to post" },
];
