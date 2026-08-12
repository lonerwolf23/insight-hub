import { BadgeCheck } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  hue: number;
  verified?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
} as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, hue, verified = false, size = "md", ...props }, ref) => {
    return (
      <div className={cn("relative shrink-0", className)} ref={ref} {...props}>
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl font-display font-semibold text-white ring-1 ring-white/20",
            SIZES[size],
          )}
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 65% 52%), hsl(${(hue + 48) % 360} 70% 42%))`,
          }}
        >
          {initials(name)}
        </div>
        {verified && (
          <BadgeCheck className="absolute -bottom-1 -right-1 h-[18px] w-[18px] rounded-full bg-background p-[2px] text-info" />
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
