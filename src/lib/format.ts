const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFmt = new Intl.NumberFormat("en-US");

export function formatCompact(n: number): string {
  return compactFmt.format(n);
}

export function formatNumber(n: number): string {
  return numberFmt.format(Math.round(n));
}

export function formatSigned(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${numberFmt.format(Math.round(Math.abs(n)))}`;
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatMoney(n: number): string {
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(n >= 100000 ? 1 : 2)}K`;
  }
  return `$${n.toFixed(0)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatHour12(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

export function ageLabel(days: number): string {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years >= 2) return `${years} yrs`;
  if (years === 1) return `${12 + months} mo`;
  if (months >= 1) return `${months} mo`;
  return `${Math.max(1, days)} d`;
}
