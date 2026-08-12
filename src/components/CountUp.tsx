import { useEffect, useRef, useState } from "react";

/**
 * Animates from the previous value to `target` with an ease-out curve.
 * Returns the live value; format it with the caller's formatter.
 */
export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      fromRef.current = target;
      setValue(target);
    };
    const tick = (now: number) => {
      if (done) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    // rAF is throttled when the tab is hidden — a timeout guarantees completion.
    const fallback = setTimeout(finish, duration + 80);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [target, duration]);

  return value;
}

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}

export function AnimatedNumber({ value, format, duration }: AnimatedNumberProps) {
  const v = useCountUp(value, duration);
  return <>{format ? format(v) : Math.round(v)}</>;
}

