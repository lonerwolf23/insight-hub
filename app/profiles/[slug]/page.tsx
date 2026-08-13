"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  MessagesSquare,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { AnimatedNumber } from "@/components/CountUp";
import { ChartCard } from "@/components/ChartCard";
import { CommentsPanel } from "@/components/CommentsPanel";
import { PostingRecommendation } from "@/components/PostingRecommendation";
import { PostsTable } from "@/components/PostsTable";
import { ProfileImage } from "@/components/ProfileImage";
import { StatTile } from "@/components/StatTile";
import { BestReelHour } from "@/components/charts/BestReelHour";
import { CompareBars } from "@/components/charts/CompareBars";
import { EngagementTrend } from "@/components/charts/EngagementTrend";
import { GlobalPostWindowChart } from "@/components/charts/GlobalPostWindow";
import { GlobalReelTimes } from "@/components/charts/GlobalReelTimes";
import { PostTypeDonut } from "@/components/charts/PostTypeDonut";
import { PostsByMonth } from "@/components/charts/PostsByMonth";
import { TopHashtags } from "@/components/charts/TopHashtags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompact, formatDate, formatNumber } from "@/lib/format";
import { profileFromSlug } from "@/lib/slugs";
import { useProfiles } from "@/lib/use-profiles";

export default function ProfileDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const username = profileFromSlug(slug);
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

  const metrics = data.metrics.find((m) => m.username === username);

  if (!metrics) {
    return (
      <div className="glass flex flex-col items-center gap-3 p-16 text-center">
        <BarChart3 className="h-8 w-8 text-danger" />
        <h2 className="font-display text-lg font-semibold">Profile not found</h2>
        <p className="text-sm text-muted">
          <span className="font-mono">@{username}</span> is not in the profile dump.
        </p>
        <Button asChild variant="secondary" className="mt-2">
          <Link href="/profiles">
            <ArrowLeft className="h-4 w-4" />
            Back to profiles
          </Link>
        </Button>
      </div>
    );
  }

  const m = metrics;
  const posts = data.map[m.username].posts;
  const hue = m.username === "drmokshaadvocate" ? 250 : 200;
  const weekdayData = m.weekday.map((d) => ({
    label: d.label,
    reels: Math.round(d.reelAvgEngagement),
    posts: Math.round(d.postAvgEngagement),
  }));

  return (
    <div className="space-y-8">
      {/* back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted">
        <Link href="/profiles">
          <ArrowLeft className="h-4 w-4" />
          Profiles
        </Link>
      </Button>

      {/* identity header */}
      <div className="glass p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ProfileImage src={m.profilePicUrl} name={m.fullName} size={96} hue={hue} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {m.fullName}
              </h1>
              {m.isVerified && (
                <Badge variant="info">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {m.isBusiness && (
                <Badge variant="accent">
                  <Building2 className="h-3 w-3" />
                  Business
                </Badge>
              )}
              {m.isPrivate && (
                <Badge variant="warn">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
            </div>
            <p className="mt-1 font-mono text-sm text-muted">
              Instagram ID: <span className="text-accent-strong">@{m.username}</span>
            </p>
            {m.bio && (
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted">
                {m.bio}
              </p>
            )}
            {m.externalUrl && (
              <a
                href={m.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:text-accent-strong"
              >
                <ExternalLink className="h-3 w-3" />
                {m.externalUrl}
              </a>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-faint">
              <span>
                {formatDate(m.firstPostDate ?? "")} → {formatDate(m.lastPostDate ?? "")}
              </span>
              <span>·</span>
              <span>
                {formatNumber(m.analyzedPosts)} of {formatNumber(m.totalPosts)} posts analyzed (
                {m.coveragePct.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4">
          <InlineStat icon={Users} label="Followers" value={formatNumber(m.followers)} />
          <InlineStat icon={UserPlus} label="Following" value={formatNumber(m.following)} />
          <InlineStat icon={FileText} label="Posts" value={formatNumber(m.totalPosts)} />
          <InlineStat icon={Zap} label="Engagement rate" value={`${m.engagementRate.toFixed(2)}%`} />
        </div>
      </div>

      {/* key stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Total likes"
          icon={Heart}
          tone="accent"
          value={<AnimatedNumber value={m.totalLikes} format={formatCompact} />}
          sub={`across ${formatNumber(m.analyzedPosts)} posts`}
        />
        <StatTile
          label="Total comments"
          icon={MessageCircle}
          value={<AnimatedNumber value={m.totalComments} format={formatCompact} />}
          sub={`${formatNumber(m.totalCommentTexts)} comment texts captured`}
        />
        <StatTile
          label="Avg likes / post"
          icon={TrendingUp}
          value={<AnimatedNumber value={m.avgLikes} format={formatCompact} />}
          sub="mean of analyzed posts"
        />
        <StatTile
          label="Avg comments / post"
          icon={MessagesSquare}
          value={<AnimatedNumber value={m.avgComments} format={formatCompact} />}
          sub="mean of analyzed posts"
        />
        <StatTile
          label="Engagement rate"
          icon={Zap}
          tone={m.engagementRate >= 10 ? "good" : "default"}
          value={<span className="text-xl">{m.engagementRate.toFixed(2)}%</span>}
          sub="likes+comments per follower per post"
        />
        <StatTile
          label="Top post likes"
          icon={Heart}
          value={
            m.bestPost ? (
              <span className="text-xl">{formatCompact(m.bestPost.likes)}</span>
            ) : (
              "—"
            )
          }
          sub={
            m.bestPost ? (
              <a
                href={m.bestPost.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-wide text-accent hover:text-accent-strong"
              >
                {m.bestPost.post_id} ↗
              </a>
            ) : (
              "no likes recorded"
            )
          }
        />
      </div>

      {/* trend + post types */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Likes & comments over time"
          description="Engagement per period across analyzed posts"
          className="lg:col-span-2"
        >
          <EngagementTrend
            seriesByGranularity={{
              day: m.daily,
              month: m.monthly,
              quarter: m.quarterly,
              year: m.yearly,
            }}
          />
        </ChartCard>
        <ChartCard title="Post types" description="Breakdown by content format">
          <PostTypeDonut data={m.postTypes} />
        </ChartCard>
      </div>

      {/* posting frequency + hashtags */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Posting frequency" description="Posts published per month">
          <PostsByMonth data={m.monthly} />
        </ChartCard>
        <ChartCard
          title="Top hashtags"
          description={`${formatNumber(m.uniqueHashtags)} unique hashtags across analyzed posts`}
        >
          <TopHashtags data={m.topHashtags} />
        </ChartCard>
      </div>

      {/* recommended posting time */}
      <PostingRecommendation />

      {/* best time to post */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Best hour to post a Reel"
          description="Avg likes + comments per Reel, by hour published"
          headerSlot={
            m.bestReelHour && (
              <Badge variant="accent">
                <Clock className="h-3 w-3" />
                Peak {m.bestReelHour.label}
              </Badge>
            )
          }
        >
          <BestReelHour data={m.reelHourly} />
        </ChartCard>
        <ChartCard
          title="Best day to post"
          description="Avg engagement by day of week — Reels vs. Posts"
          headerSlot={
            m.bestDay && (
              <Badge variant="accent">
                <CalendarDays className="h-3 w-3" />
                Peak {m.bestDay.label}
              </Badge>
            )
          }
        >
          <div className="mb-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: "#7b6cff" }} />
              Reels
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: "#55c2f5" }} />
              Posts
            </span>
          </div>
          <CompareBars
            data={weekdayData}
            series={[
              { key: "reels", name: "Reels", color: "#7b6cff" },
              { key: "posts", name: "Posts", color: "#55c2f5" },
            ]}
            height={220}
          />
        </ChartCard>
      </div>

      {/* global benchmark — industry research, not this account's data */}
      <div className="glass p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm font-semibold tracking-tight">
            Global best time to post
          </h3>
          <span className="label-mono ml-auto text-faint">industry benchmark, not @{m.username}</span>
        </div>
        <p className="mb-4 max-w-3xl text-xs leading-relaxed text-muted">
          Aggregated from published cross-account Instagram research covering millions of posts —
          not derived from this profile&apos;s own history. Use it as a starting point; actual
          results vary by audience, niche and time zone.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Reels — peak hours by day, worldwide"
            description="SocialPilot: ~250K Reels across 30K+ connected accounts"
          >
            <GlobalReelTimes />
          </ChartCard>
          <ChartCard
            title="Posts — peak windows by day, worldwide"
            description="Sprout Social: ~2B engagements across 307K profiles"
          >
            <GlobalPostWindowChart />
          </ChartCard>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-faint">
          Fridays show no significant peak and weekends are the weakest days across both studies.
        </p>
      </div>

      {/* posts table */}
      <div className="glass p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm font-semibold tracking-tight">
            All analyzed posts
          </h3>
          <span className="label-mono ml-auto text-faint">
            {formatNumber(m.analyzedPosts)} posts · click headers to sort
          </span>
        </div>
        <PostsTable posts={posts} />
      </div>

      {/* comments */}
      <div className="glass p-5">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm font-semibold tracking-tight">Comments</h3>
          <span className="label-mono ml-auto text-faint">
            {formatNumber(m.postsWithComments)} posts with captured comments
          </span>
        </div>
        <CommentsPanel posts={posts} />
      </div>
    </div>
  );
}

function InlineStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-soft flex items-center gap-3 p-3">
      <Icon className="h-4 w-4 shrink-0 text-faint" />
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold tracking-tight">{value}</p>
        <p className="label-mono text-faint">{label}</p>
      </div>
    </div>
  );
}
