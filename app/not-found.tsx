import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="glass flex flex-col items-center gap-4 p-16 text-center">
      <Compass className="h-10 w-10 text-accent" />
      <h1 className="font-display text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-sm text-muted">
        The page you are looking for does not exist. Head back to the dashboard to explore the
        Instagram metrics.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
