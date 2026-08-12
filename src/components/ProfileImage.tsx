"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface ProfileImageProps {
  src: string | null;
  name: string;
  hue?: number;
  size?: number;
  className?: string;
}

export function ProfileImage({
  src,
  name,
  hue = 250,
  size = 96,
  className,
}: ProfileImageProps) {
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?";

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl font-display font-semibold text-white ring-1 ring-white/20",
          className,
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.32,
          background: `linear-gradient(135deg, hsl(${hue} 65% 52%), hsl(${(hue + 48) % 360} 70% 42%))`,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-line", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setFailed(true)}
        unoptimized
      />
    </div>
  );
}
