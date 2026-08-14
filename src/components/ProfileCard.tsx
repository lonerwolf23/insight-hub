"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FileText,
  Heart,
  MessageCircle,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { AnimatedNumber } from "@/components/CountUp";
import { ProfileImage } from "@/components/ProfileImage";
import { Badge } from "@/components/ui/badge";
import type { ProfileMetrics } from "@/lib/metrics";
import { formatCompact, formatPercent } from "@/lib/format";
import { profileSlug } from "@/lib/slugs";

interface ProfileCardProps {
  metrics: ProfileMetrics;
  hue?: number;
}

export function ProfileCard({ metrics: m, hue = 250 }: ProfileCardProps) {
  return (
    <Link
      href={`/profiles/${profileSlug(m.username)}`}
      className="glass group relative block overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong"
      style={{
        boxShadow: `0 0 0 1px var(--line)`,
      }}
    >
      {/* hue-tinted glow that blooms on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: `hsl(${hue} 80% 55%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(${hue} 80% 62%), transparent)`,
        }}
      />

      <div className="relative flex items-start gap-4">
        <div className="transition-transform duration-300 group-hover:scale-105">
          <ProfileImage src={m.profilePicUrl} name={m.fullName} size={64} hue={hue} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base font-semibold tracking-tight group-hover:text-accent-strong">
              {m.fullName}
            </h2>
            {m.engagementRate >= 10 ? (
              <Badge variant="good">High engagement</Badge>
            ) : (
              <Badge variant="muted">Long history</Badge>
            )}
            {m.isBusiness && (
              <Badge variant="info">
                <Building2 className="h-2.5 w-2.5" />
                Business
              </Badge>
            )}
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted">@{m.username}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat icon={Users} value={m.followers} label="Followers" />
            <MiniStat icon={UserPlus} value={m.following} label="Following" />
            <MiniStat icon={FileText} value={m.totalPosts} label="Posts" />
          </div>

        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Heart className="h-3.5 w-3.5 text-danger" />
          <span className="font-mono text-foreground">{formatCompact(m.totalLikes)}</span>
          likes
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <MessageCircle className="h-3.5 w-3.5 text-info" />
          <span className="font-mono text-foreground">{formatCompact(m.totalComments)}</span>
          comments
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
          <TrendingUp className="h-3.5 w-3.5 text-good" />
          <span className="font-mono text-foreground">{formatPercent(m.engagementRate, 2)}</span>
          engagement
        </span>
      </div>
    </Link>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: number;
  label: string;
}) {
  return (
    <div className="glass-soft min-w-0 p-2.5">
      <div className="flex items-center gap-1 text-faint">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="label-mono truncate">{label}</span>
      </div>
      <p className="mt-1 truncate font-display text-lg font-semibold tracking-tight">
        <AnimatedNumber value={value} format={formatCompact} />
      </p>
    </div>
  );
}
