import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  // Starts false to match the server-rendered markup exactly (the server has
  // no access to localStorage), then syncs to the real class ThemeBootstrap
  // already applied — via useLayoutEffect so it lands before the browser
  // paints, instead of in the lazy useState initializer, which would read a
  // client-only value during hydration and trigger a mismatch.
  const [dark, setDark] = useState(false);

  useLayoutEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("insight-hub-theme", next ? "dark" : "light");
    } catch {
      // storage may be unavailable (private mode) — theme still applies for the session
    }
    setDark(next);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className={cn("text-faint hover:text-foreground", className)}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Switch to {dark ? "light" : "dark"} mode</TooltipContent>
    </Tooltip>
  );
}
