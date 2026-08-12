"use client";

import { useEffect, useState } from "react";

/**
 * Resolves the app's CSS custom properties so recharts strokes and fills
 * follow the active light/dark theme. Listens for `.light` class changes.
 */
export function useCssColors() {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const compute = () => {
      const s = getComputedStyle(document.documentElement);
      const pick = (name: string) => s.getPropertyValue(name).trim();
      setColors({
        fg: pick("--fg"),
        muted: pick("--muted"),
        faint: pick("--faint"),
        line: pick("--line"),
        lineStrong: pick("--line-strong"),
        accent: pick("--accent"),
        accentStrong: pick("--accent-strong"),
        good: pick("--good"),
        warn: pick("--warn"),
        danger: pick("--danger"),
        info: pick("--info"),
        raised: pick("--raised"),
        bg: pick("--bg"),
      });
    };
    compute();
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}

export interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  fill?: string;
  stroke?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  format?: (n: number) => string;
}

export function ChartTooltip({ active, label, payload, format }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-soft px-3 py-2 text-xs shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)]">
      <p className="label-mono mb-1 text-faint">{label}</p>
      {payload.map((entry, i) => (
        <div key={`${entry.dataKey ?? entry.name ?? i}`} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color ?? entry.fill ?? entry.stroke }}
          />
          <span className="text-muted">{entry.name}</span>
          <span className="ml-auto pl-4 font-mono text-foreground">
            {format && typeof entry.value === "number"
              ? format(entry.value)
              : String(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
