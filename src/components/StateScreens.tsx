import { AlertTriangle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="glass flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function ProfileCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass flex items-start gap-4 p-5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatTilesSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-soft space-y-3 p-4">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ChartCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass space-y-3 p-5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-3 h-[220px] w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
