import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// TierTarif Preloader: bewusst ohne alte Slate/Rank-Scout-Farben.
type LoadingScreenProps = {
  mode?: "fullscreen" | "overlay";
};

export const LoadingScreen = ({ mode = "fullscreen" }: LoadingScreenProps) => {
  const isOverlay = mode === "overlay";

  return (
    <div
      className={cn(
        "z-[100] flex items-center justify-center animate-in fade-in duration-300",
        isOverlay
          ? "fixed inset-x-0 top-24 px-4 pointer-events-none"
          : "tt-loading-bg fixed inset-0 flex-col"
      )}
    >
      {!isOverlay && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/18 blur-[92px]" />
      )}

      <div
        className={cn(
          "relative z-10",
          isOverlay
            ? "tt-loading-card flex items-center gap-4 rounded-2xl px-5 py-4"
            : "flex flex-col items-center gap-6 rounded-[2rem] px-8 py-7"
        )}
      >
        <div className="relative shrink-0">
          <div className="tt-loading-glow absolute inset-0 rounded-full blur-xl animate-pulse" />
          <div className="tt-loading-mark relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>

        <div className={cn("flex flex-col", isOverlay ? "items-start gap-1" : "items-center gap-2")}> 
          <h2 className="font-display text-xl font-black tracking-tight text-white">TierTarif</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-[#FAF7F0]/78 animate-pulse">
            Portal wird geladen...
          </p>
        </div>
      </div>
    </div>
  );
};
