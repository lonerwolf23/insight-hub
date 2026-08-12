import type { Post, Profile } from "./types";

export type Granularity = "month" | "quarter" | "year";

export interface PostTypeSlice {
  type: string;
  label: string;
  count: number;
  share: number;
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
  monthly: SeriesPoint[];
  quarterly: SeriesPoint[];
  yearly: SeriesPoint[];
  firstPostDate: string | null;
  lastPostDate: string | null;
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
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function keyOf(d: Date, g: Granularity): string {
  const y = d.getFullYear();
  if (g === "year") return String(y);
  if (g === "quarter") return `${y}-Q${Math.floor(d.getMonth() / 3) + 1}`;
  return `${y}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelOf(key: string, g: Granularity): string {
  const d = parseKey(key, g);
  if (g === "year") return String(d.getFullYear());
  if (g === "quarter")
    return `Q${Math.floor(d.getMonth() / 3) + 1} '${String(d.getFullYear()).slice(2)}`;
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function advance(d: Date, g: Granularity): Date {
  const next = new Date(d);
  if (g === "year") next.setFullYear(next.getFullYear() + 1);
  else if (g === "quarter") next.setMonth(next.getMonth() + 3);
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

  const typeCounts = new Map<string, number>();
  for (const p of posts) typeCounts.set(p.post_type, (typeCounts.get(p.post_type) ?? 0) + 1);
  const postTypes: PostTypeSlice[] = [...typeCounts.entries()]
    .map(([type, count]) => ({
      type,
      label: POST_TYPE_LABELS[type] ?? type,
      count,
      share: analyzedPosts ? (count / analyzedPosts) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const tagCounts = new Map<string, number>();
  for (const p of posts) for (const tag of p.hashtags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  const topHashtags: HashtagSlice[] = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag, count]) => ({ tag, count }));

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
    monthly: buildSeries(posts, "month"),
    quarterly: buildSeries(posts, "quarter"),
    yearly: buildSeries(posts, "year"),
    firstPostDate: analyzedPosts ? posts[analyzedPosts - 1].timestamp : null,
    lastPostDate: analyzedPosts ? posts[0].timestamp : null,
  };
}
