import type { Post, Profile } from "./types";

export type Granularity = "day" | "month" | "quarter" | "year";

export interface PostTypeSlice {
  type: string;
  label: string;
  count: number;
  share: number;
  avgEngagement: number;
}

export interface SeriesPoint {
  key: string;
  label: string;
  likes: number;
  comments: number;
  posts: number;
}

export interface HashtagSlice {
  tag: string;
  count: number;
  avgEngagement?: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  dayLabel: string;
  hourLabel: string;
  posts: number;
  avgEngagement: number;
}

export interface CaptionBucket {
  label: string;
  avgEngagement: number;
  count: number;
}

export interface CaptionMetrics {
  length: CaptionBucket[];
  question: CaptionBucket[];
  cta: CaptionBucket[];
  emoji: CaptionBucket[];
}

export interface CommenterSlice {
  commenter: string;
  count: number;
  totalLikesGiven: number;
}

export interface HourSlice {
  hour: number;
  label: string;
  posts: number;
  avgEngagement: number;
}

export interface DaySlice {
  day: number;
  label: string;
  reelPosts: number;
  reelAvgEngagement: number;
  postPosts: number;
  postAvgEngagement: number;
}

export interface ProfileMetrics {
  username: string;
  fullName: string;
  bio: string | null;
  externalUrl: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  isBusiness: boolean;
  followers: number;
  following: number;
  totalPosts: number;
  analyzedPosts: number;
  coveragePct: number;
  totalLikes: number;
  totalComments: number;
  totalCommentTexts: number;
  postsWithComments: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  likesPerFollower: number;
  bestPost: Post | null;
  postTypes: PostTypeSlice[];
  topHashtags: HashtagSlice[];
  uniqueHashtags: number;
  daily: SeriesPoint[];
  monthly: SeriesPoint[];
  quarterly: SeriesPoint[];
  yearly: SeriesPoint[];
  firstPostDate: string | null;
  lastPostDate: string | null;
  reelHourly: HourSlice[];
  postHourly: HourSlice[];
  weekday: DaySlice[];
  bestReelHour: HourSlice | null;
  bestPostHour: HourSlice | null;
  bestDay: DaySlice | null;
  bestReelDay: DaySlice | null;
  bestPostDay: DaySlice | null;
  heatmap: HeatmapCell[];
  peakHeatmapCell: HeatmapCell | null;
  hashtagEffectiveness: HashtagSlice[];
  captionMetrics: CaptionMetrics;
  commentToLikeRatio: number;
  topCommenters: CommenterSlice[];
}

const POST_TYPE_LABELS: Record<string, string> = {
  GraphImage: "Image",
  GraphVideo: "Video",
  GraphSidecar: "Carousel",
};

/* ----------------------------- time buckets ----------------------------- */

function parseKey(key: string, g: Granularity): Date {
  if (g === "year") return new Date(Number(key), 0, 1);
  if (g === "quarter") {
    const [y, q] = key.split("-Q").map(Number);
    return new Date(y, (q - 1) * 3, 1);
  }
  if (g === "day") {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function keyOf(d: Date, g: Granularity): string {
  const y = d.getFullYear();
  if (g === "year") return String(y);
  if (g === "quarter") return `${y}-Q${Math.floor(d.getMonth() / 3) + 1}`;
  if (g === "day")
    return `${y}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${y}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelOf(key: string, g: Granularity): string {
  const d = parseKey(key, g);
  if (g === "year") return String(d.getFullYear());
  if (g === "quarter")
    return `Q${Math.floor(d.getMonth() / 3) + 1} '${String(d.getFullYear()).slice(2)}`;
  if (g === "day")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function advance(d: Date, g: Granularity): Date {
  const next = new Date(d);
  if (g === "year") next.setFullYear(next.getFullYear() + 1);
  else if (g === "quarter") next.setMonth(next.getMonth() + 3);
  else if (g === "day") next.setDate(next.getDate() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

function buildSeries(posts: Post[], g: Granularity): SeriesPoint[] {
  const map = new Map<string, SeriesPoint>();
  for (const p of posts) {
    const key = keyOf(new Date(p.timestamp), g);
    const cur = map.get(key) ?? {
      key,
      label: labelOf(key, g),
      likes: 0,
      comments: 0,
      posts: 0,
    };
    cur.likes += p.likes;
    cur.comments += p.comments_count;
    cur.posts += 1;
    map.set(key, cur);
  }
  const keys = [...map.keys()].sort();
  if (keys.length === 0) return [];
  if (g === "day") {
    // Sparse: only actual posting dates, not every calendar day in between —
    // some accounts span a decade, so filling daily zeros would blow up the chart.
    return keys.map((key) => map.get(key)!);
  }
  // Fill gaps so the line chart is continuous (dormant periods show as zero).
  const out: SeriesPoint[] = [];
  let cursor = parseKey(keys[0], g);
  const last = parseKey(keys[keys.length - 1], g);
  while (cursor.getTime() <= last.getTime()) {
    const key = keyOf(cursor, g);
    out.push(
      map.get(key) ?? { key, label: labelOf(key, g), likes: 0, comments: 0, posts: 0 },
    );
    cursor = advance(cursor, g);
  }
  return out;
}

/* ------------------------------ posting time ----------------------------- */

const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => {
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
});

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Instagram's dump has no explicit "reel" flag — a single-clip video post
// (post_type GraphVideo) is the closest available proxy for a Reel.
function isReel(post: Post): boolean {
  return post.post_type === "GraphVideo";
}

function buildHourly(posts: Post[]): HourSlice[] {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    posts: 0,
    engagement: 0,
  }));
  for (const p of posts) {
    const hour = new Date(p.timestamp).getHours();
    buckets[hour].posts += 1;
    buckets[hour].engagement += p.likes + p.comments_count;
  }
  return buckets.map((b) => ({
    hour: b.hour,
    label: HOUR_LABELS[b.hour],
    posts: b.posts,
    avgEngagement: b.posts ? b.engagement / b.posts : 0,
  }));
}

function buildWeekday(posts: Post[]): DaySlice[] {
  const buckets = Array.from({ length: 7 }, (_, day) => ({
    day,
    reelPosts: 0,
    reelEngagement: 0,
    postPosts: 0,
    postEngagement: 0,
  }));
  for (const p of posts) {
    const day = new Date(p.timestamp).getDay();
    const engagement = p.likes + p.comments_count;
    const bucket = buckets[day];
    if (isReel(p)) {
      bucket.reelPosts += 1;
      bucket.reelEngagement += engagement;
    } else {
      bucket.postPosts += 1;
      bucket.postEngagement += engagement;
    }
  }
  return buckets.map((b) => ({
    day: b.day,
    label: DAY_LABELS[b.day],
    reelPosts: b.reelPosts,
    reelAvgEngagement: b.reelPosts ? b.reelEngagement / b.reelPosts : 0,
    postPosts: b.postPosts,
    postAvgEngagement: b.postPosts ? b.postEngagement / b.postPosts : 0,
  }));
}

function pickBestHour(hours: HourSlice[]): HourSlice | null {
  const withPosts = hours.filter((h) => h.posts > 0);
  if (withPosts.length === 0) return null;
  return withPosts.reduce((a, b) => (b.avgEngagement > a.avgEngagement ? b : a));
}

function pickBestDay(days: DaySlice[]): DaySlice | null {
  const withPosts = days.filter((d) => d.reelPosts + d.postPosts > 0);
  if (withPosts.length === 0) return null;
  const avgOf = (d: DaySlice) =>
    (d.reelAvgEngagement * d.reelPosts + d.postAvgEngagement * d.postPosts) /
    (d.reelPosts + d.postPosts);
  return withPosts.reduce((a, b) => (avgOf(b) > avgOf(a) ? b : a));
}

function pickBestDayBy(days: DaySlice[], kind: "reel" | "post"): DaySlice | null {
  const countOf = (d: DaySlice) => (kind === "reel" ? d.reelPosts : d.postPosts);
  const avgOf = (d: DaySlice) => (kind === "reel" ? d.reelAvgEngagement : d.postAvgEngagement);
  const withPosts = days.filter((d) => countOf(d) > 0);
  if (withPosts.length === 0) return null;
  return withPosts.reduce((a, b) => (avgOf(b) > avgOf(a) ? b : a));
}

function engagementOf(p: Post): number {
  return p.likes + p.comments_count;
}

/* -------------------------- day x hour heatmap --------------------------- */

function buildHeatmap(posts: Post[]): HeatmapCell[] {
  const buckets = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ posts: 0, engagement: 0 })),
  );
  for (const p of posts) {
    const d = new Date(p.timestamp);
    const bucket = buckets[d.getDay()][d.getHours()];
    bucket.posts += 1;
    bucket.engagement += engagementOf(p);
  }
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const b = buckets[day][hour];
      cells.push({
        day,
        hour,
        dayLabel: DAY_LABELS[day],
        hourLabel: HOUR_LABELS[hour],
        posts: b.posts,
        avgEngagement: b.posts ? b.engagement / b.posts : 0,
      });
    }
  }
  return cells;
}

function pickPeakCell(cells: HeatmapCell[]): HeatmapCell | null {
  const withPosts = cells.filter((c) => c.posts > 0);
  if (withPosts.length === 0) return null;
  return withPosts.reduce((a, b) => (b.avgEngagement > a.avgEngagement ? b : a));
}

/* --------------------------- hashtag effectiveness ------------------------ */

// Tags used fewer than this many times are excluded — a single lucky post
// would otherwise dominate the "best performing" ranking.
const MIN_HASHTAG_USES = 3;

function buildHashtagEffectiveness(posts: Post[]): HashtagSlice[] {
  const agg = new Map<string, { count: number; engagement: number }>();
  for (const p of posts) {
    const engagement = engagementOf(p);
    for (const tag of p.hashtags) {
      const cur = agg.get(tag) ?? { count: 0, engagement: 0 };
      cur.count += 1;
      cur.engagement += engagement;
      agg.set(tag, cur);
    }
  }
  return [...agg.entries()]
    .filter(([, v]) => v.count >= MIN_HASHTAG_USES)
    .map(([tag, v]) => ({ tag, count: v.count, avgEngagement: v.engagement / v.count }))
    .sort((a, b) => (b.avgEngagement ?? 0) - (a.avgEngagement ?? 0))
    .slice(0, 12);
}

/* ----------------------------- caption patterns --------------------------- */

// Common Instagram engagement-bait phrasing — a rough heuristic, not NLP.
const CTA_KEYWORDS = [
  "comment below",
  "comment \"",
  "tag a friend",
  "tag someone",
  "tag your",
  "link in bio",
  "dm us",
  "dm me",
  "double tap",
  "save this",
  "share this",
  "swipe up",
  "click the link",
];

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

function captionLengthBucket(p: Post): string {
  const len = p.caption?.trim().length ?? 0;
  if (len === 0) return "No caption";
  if (len < 50) return "Short (<50)";
  if (len < 150) return "Medium (50–150)";
  return "Long (150+)";
}

function questionBucket(p: Post): string {
  return p.caption?.includes("?") ? "Has question" : "No question";
}

function ctaBucket(p: Post): string {
  const text = p.caption?.toLowerCase() ?? "";
  return CTA_KEYWORDS.some((kw) => text.includes(kw)) ? "Has CTA" : "No CTA";
}

function emojiCountBucket(p: Post): string {
  const count = p.caption?.match(EMOJI_RE)?.length ?? 0;
  if (count === 0) return "No emoji";
  if (count <= 3) return "Some (1–3)";
  return "Many (4+)";
}

function bucketize(
  posts: Post[],
  classify: (p: Post) => string,
  order: string[],
): CaptionBucket[] {
  const agg = new Map<string, { count: number; engagement: number }>();
  for (const p of posts) {
    const key = classify(p);
    const cur = agg.get(key) ?? { count: 0, engagement: 0 };
    cur.count += 1;
    cur.engagement += engagementOf(p);
    agg.set(key, cur);
  }
  return order
    .filter((label) => agg.has(label))
    .map((label) => {
      const v = agg.get(label)!;
      return { label, count: v.count, avgEngagement: v.count ? v.engagement / v.count : 0 };
    });
}

function buildCaptionMetrics(posts: Post[]): CaptionMetrics {
  return {
    length: bucketize(posts, captionLengthBucket, [
      "No caption",
      "Short (<50)",
      "Medium (50–150)",
      "Long (150+)",
    ]),
    question: bucketize(posts, questionBucket, ["Has question", "No question"]),
    cta: bucketize(posts, ctaBucket, ["Has CTA", "No CTA"]),
    emoji: bucketize(posts, emojiCountBucket, ["No emoji", "Some (1–3)", "Many (4+)"]),
  };
}

/* ---------------------------- comment quality ----------------------------- */

function buildTopCommenters(posts: Post[]): CommenterSlice[] {
  const agg = new Map<string, { count: number; likes: number }>();
  for (const p of posts) {
    for (const c of p.comments) {
      const cur = agg.get(c.commenter) ?? { count: 0, likes: 0 };
      cur.count += 1;
      cur.likes += c.likes;
      agg.set(c.commenter, cur);
    }
  }
  return [...agg.entries()]
    .map(([commenter, v]) => ({ commenter, count: v.count, totalLikesGiven: v.likes }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/* ------------------------------ main entry ------------------------------ */

export function computeMetrics(profile: Profile): ProfileMetrics {
  const posts = [...profile.posts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const analyzedPosts = posts.length;
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p.comments_count, 0);
  const totalCommentTexts = posts.reduce((s, p) => s + p.comments.length, 0);
  const postsWithComments = posts.filter((p) => p.comments.length > 0).length;
  const avgLikes = analyzedPosts ? Math.round(totalLikes / analyzedPosts) : 0;
  const avgComments = analyzedPosts ? Math.round(totalComments / analyzedPosts) : 0;
  const engagementRate =
    profile.followers > 0 && analyzedPosts > 0
      ? ((totalLikes + totalComments) / profile.followers / analyzedPosts) * 100
      : 0;
  const likesPerFollower = profile.followers > 0 ? totalLikes / profile.followers : 0;

  const typeCounts = new Map<string, { count: number; engagement: number }>();
  for (const p of posts) {
    const cur = typeCounts.get(p.post_type) ?? { count: 0, engagement: 0 };
    cur.count += 1;
    cur.engagement += engagementOf(p);
    typeCounts.set(p.post_type, cur);
  }
  const postTypes: PostTypeSlice[] = [...typeCounts.entries()]
    .map(([type, v]) => ({
      type,
      label: POST_TYPE_LABELS[type] ?? type,
      count: v.count,
      share: analyzedPosts ? (v.count / analyzedPosts) * 100 : 0,
      avgEngagement: v.count ? v.engagement / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const tagCounts = new Map<string, number>();
  for (const p of posts) for (const tag of p.hashtags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  const topHashtags: HashtagSlice[] = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag, count]) => ({ tag, count }));

  const reelHourly = buildHourly(posts.filter(isReel));
  const postHourly = buildHourly(posts.filter((p) => !isReel(p)));
  const weekday = buildWeekday(posts);
  const heatmap = buildHeatmap(posts);

  return {
    username: profile.username,
    fullName: profile.full_name,
    bio: profile.biography,
    externalUrl: profile.external_url,
    profilePicUrl: profile.profile_pic_url,
    isVerified: profile.is_verified,
    isPrivate: profile.is_private,
    isBusiness: profile.is_business,
    followers: profile.followers,
    following: profile.following,
    totalPosts: profile.total_posts,
    analyzedPosts,
    coveragePct: profile.total_posts ? (analyzedPosts / profile.total_posts) * 100 : 0,
    totalLikes,
    totalComments,
    totalCommentTexts,
    postsWithComments,
    avgLikes,
    avgComments,
    engagementRate,
    likesPerFollower,
    bestPost:
      posts.length > 0
        ? posts.reduce((a, b) => (b.likes > a.likes ? b : a))
        : null,
    postTypes,
    topHashtags,
    uniqueHashtags: tagCounts.size,
    daily: buildSeries(posts, "day"),
    monthly: buildSeries(posts, "month"),
    quarterly: buildSeries(posts, "quarter"),
    yearly: buildSeries(posts, "year"),
    firstPostDate: analyzedPosts ? posts[analyzedPosts - 1].timestamp : null,
    lastPostDate: analyzedPosts ? posts[0].timestamp : null,
    reelHourly,
    postHourly,
    weekday,
    bestReelHour: pickBestHour(reelHourly),
    bestPostHour: pickBestHour(postHourly),
    bestDay: pickBestDay(weekday),
    bestReelDay: pickBestDayBy(weekday, "reel"),
    bestPostDay: pickBestDayBy(weekday, "post"),
    heatmap,
    peakHeatmapCell: pickPeakCell(heatmap),
    hashtagEffectiveness: buildHashtagEffectiveness(posts),
    captionMetrics: buildCaptionMetrics(posts),
    commentToLikeRatio: totalLikes > 0 ? (totalComments / totalLikes) * 100 : 0,
    topCommenters: buildTopCommenters(posts),
  };
}
