import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  mode?: "fullscreen" | "overlay";
};

export const LoadingScreen = ({ mode = "fullscreen" }: LoadingScreenProps) => {
  const isOverlay = mode === "overlay";

  return (
    <div
      className={cn(
        "z-[100] flex items-center justify-center text-white animate-in fade-in duration-300",
        isOverlay
          ? "fixed inset-x-0 top-24 px-4 pointer-events-none"
          : "fixed inset-0 flex-col bg-slate-900"
      )}
    >
      {!isOverlay && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[80px] pointer-events-none" />
      )}

      <div
        className={cn(
          "relative z-10",
          isOverlay
            ? "flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/92 px-5 py-4 shadow-2xl backdrop-blur-xl"
            : "flex flex-col items-center gap-6"
        )}
      >
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-secondary/40 rounded-full blur-xl animate-pulse" />
          <Loader2 className="w-12 h-12 text-secondary animate-spin relative z-10" />
        </div>

        <div className={cn("flex flex-col", isOverlay ? "items-start gap-1" : "items-center gap-2")}>
          <h2 className="text-xl font-display font-bold tracking-wider text-white">PORTAL</h2>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] animate-pulse">Portal wird geladen...</p>
        </div>
      </div>
    </div>
  );
};
