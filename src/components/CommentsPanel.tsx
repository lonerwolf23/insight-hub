"use client";

import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface CommentsPanelProps {
  posts: Post[];
}

export function CommentsPanel({ posts }: CommentsPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const comments = useMemo(() => {
    const rows = posts.flatMap((post) =>
      post.comments.map((c) => ({
        ...c,
        postId: post.post_id,
        postUrl: post.url,
      })),
    );
    return rows.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [posts]);

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <MessageCircle className="h-6 w-6 text-faint" />
        <p className="text-sm text-muted">No comment text was captured for this profile.</p>
        <p className="max-w-md text-xs text-faint">
          The dump recorded {posts.reduce((s, p) => s + p.comments_count, 0)} comment
          counts, but the comment bodies themselves were not included in the scrape.
        </p>
      </div>
    );
  }

  const visible = showAll ? comments : comments.slice(0, 25);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="label-mono text-faint">Captured comments</span>
        <span className="rounded-full border border-line bg-raised/40 px-2 py-0.5 font-mono text-[10px] text-muted">
          {comments.length}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          sorted by date
        </span>
      </div>
      <div className="space-y-2">
        {visible.map((c, i) => (
          <div key={`${c.postId}-${i}`} className="glass-soft p-3.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-semibold text-accent-strong">
                @{c.commenter}
              </span>
              <span className="text-faint">·</span>
              <span className="text-faint">{formatDate(c.timestamp)}</span>
              <span className="ml-auto flex items-center gap-1 text-faint">
                <Heart className="h-3 w-3" />
                {c.likes}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.text}</p>
            <a
              href={c.postUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-faint hover:text-accent"
            >
              on post {c.postId}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
      {!showAll && comments.length > 25 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full rounded-xl border border-line py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-line-strong hover:text-foreground"
        >
          Show all {comments.length} comments
        </button>
      )}
    </div>
  );
}
