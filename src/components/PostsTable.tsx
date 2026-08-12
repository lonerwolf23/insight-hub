"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Layers,
  MessageCircle,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const TYPE_META: Record<string, { label: string; icon: typeof ImageIcon }> = {
  GraphImage: { label: "Image", icon: ImageIcon },
  GraphVideo: { label: "Video", icon: Video },
  GraphSidecar: { label: "Carousel", icon: Layers },
};

type SortKey = "date" | "likes" | "comments";

interface PostsTableProps {
  posts: Post[];
}

export function PostsTable({ posts }: PostsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const types = useMemo(() => {
    const set = new Set(posts.map((p) => p.post_type));
    return [...set];
  }, [posts]);

  const rows = useMemo(() => {
    let out = typeFilter === "all" ? posts : posts.filter((p) => p.post_type === typeFilter);
    out = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortKey === "likes") cmp = a.likes - b.likes;
      else cmp = a.comments_count - b.comments_count;
      return dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [posts, sortKey, dir, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
    setPage(0);
  };

  const sortIcon = (key: SortKey) => {
    if (key !== sortKey) return null;
    return dir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-accent-strong" />
    ) : (
      <ArrowDown className="h-3 w-3 text-accent-strong" />
    );
  };

  return (
    <div className="space-y-4">
      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-mono mr-1 text-faint">Type</span>
        {["all", ...types].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTypeFilter(t);
              setPage(0);
            }}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
              typeFilter === t
                ? "border-accent/50 bg-accent-soft text-accent-strong"
                : "border-line text-muted hover:border-line-strong hover:text-foreground",
            )}
          >
            {t === "all" ? "All" : TYPE_META[t]?.label ?? t}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-faint">
          {rows.length} posts
        </span>
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-raised/30 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              <th className="px-3 py-2.5 font-semibold">Type</th>
              <th className="px-3 py-2.5 font-semibold">Post</th>
              <th className="px-3 py-2.5 font-semibold">
                <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-foreground">
                  <CalendarDays className="h-3 w-3" />
                  Date
                  {sortIcon("date")}
                </button>
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                <button onClick={() => toggleSort("likes")} className="ml-auto flex items-center gap-1 hover:text-foreground">
                  <Heart className="h-3 w-3" />
                  Likes
                  {sortIcon("likes")}
                </button>
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                <button onClick={() => toggleSort("comments")} className="ml-auto flex items-center gap-1 hover:text-foreground">
                  <MessageCircle className="h-3 w-3" />
                  Comments
                  {sortIcon("comments")}
                </button>
              </th>
              <th className="px-3 py-2.5 font-semibold">Caption</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => {
              const meta = TYPE_META[p.post_type] ?? {
                label: p.post_type,
                icon: ImageIcon,
              };
              const Icon = meta.icon;
              return (
                <tr
                  key={p.post_id}
                  className="border-b border-line/60 last:border-0 hover:bg-raised/30"
                >
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                      <Icon className="h-3.5 w-3.5 text-faint" />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-1 font-mono text-xs text-accent hover:text-accent-strong"
                    >
                      {p.post_id}
                      <ExternalLink className="h-3 w-3 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                    {formatDate(p.timestamp)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground">
                    {p.likes}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground">
                    {p.comments_count}
                  </td>
                  <td className="max-w-[280px] px-3 py-2.5">
                    <p
                      className="line-clamp-2 text-xs leading-relaxed text-muted"
                      title={p.caption ?? ""}
                    >
                      {p.caption || "—"}
                    </p>
                  </td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted">
                  No posts match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-faint">
            Page {safePage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
