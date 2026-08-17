import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/AppShell";
import { ThemeBootstrap } from "@/components/ThemeBootstrap";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Insight Hub — Instagram Metrics",
    template: "%s · Insight Hub",
  },
  description:
    "Evaluate Instagram profile metrics — followers, following, posts, likes and comments — with graphs and tables.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`html{background:#f0f0f2}`}</style>
      </head>
      <body>
        <ThemeBootstrap />
        <TooltipProvider delayDuration={250}>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
