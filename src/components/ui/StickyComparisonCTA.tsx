import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StickyComparisonCTAProps = {
  targetId?: string;
  label?: string;
  helperText?: string;
  className?: string;
};

const TARGET_LOOKUP_INTERVAL_MS = 150;
const TARGET_LOOKUP_TIMEOUT_MS = 5000;

export function StickyComparisonCTA({
  targetId = "vergleich",
  label = "Tarife prüfen",
  helperText = "Direkt zum Vergleich",
  className,
}: StickyComparisonCTAProps) {
  const [isComparisonVisible, setIsComparisonVisible] = useState(false);
  const [hasTarget, setHasTarget] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let intervalId: number | null = null;
    let elapsedMs = 0;

    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const attachObserver = () => {
      const target = document.getElementById(targetId);

      if (!target) {
        setHasTarget(false);
        elapsedMs += TARGET_LOOKUP_INTERVAL_MS;

        if (elapsedMs >= TARGET_LOOKUP_TIMEOUT_MS && intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }

        return;
      }

      setHasTarget(true);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsComparisonVisible(Boolean(entry?.isIntersecting));
        },
        {
          root: null,
          rootMargin: "-18% 0px -55% 0px",
          threshold: 0,
        },
      );

      observer.observe(target);
    };

    attachObserver();
    intervalId = window.setInterval(attachObserver, TARGET_LOOKUP_INTERVAL_MS);

    return cleanup;
  }, [targetId]);

  const handleClick = () => {
    const target = document.getElementById(targetId);

    if (!target) return;

    window.history.replaceState(null, "", `#${targetId}`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isHidden = isComparisonVisible || !hasTarget;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-40 w-[90%] max-w-sm -translate-x-1/2 transition-all duration-300 md:hidden",
        isHidden
          ? "translate-y-6 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto",
        className,
      )}
      aria-hidden={isHidden}
    >
      <Button
        type="button"
        onClick={handleClick}
        className="h-14 w-full rounded-2xl bg-secondary px-5 text-base font-extrabold text-white shadow-[0_18px_45px_-18px_rgba(255,133,89,0.95)] transition-all hover:bg-secondary/90 active:scale-[0.99]"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block leading-tight">{label}</span>
            <span className="block text-xs font-semibold text-white/75">{helperText}</span>
          </span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
      </Button>
    </div>
  );
}
