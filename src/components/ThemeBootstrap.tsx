"use client";

// Runs when the client bundle is evaluated — before hydration and first paint —
// so the stored theme applies without a flash of the wrong mode. Deliberately
// avoids a <script> tag (React 19 rejects inline scripts in component trees).
if (typeof document !== "undefined") {
  try {
    if (localStorage.getItem("insight-hub-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // storage may be unavailable (private mode) — light theme remains the default
  }
}

export function ThemeBootstrap() {
  return null;
}
