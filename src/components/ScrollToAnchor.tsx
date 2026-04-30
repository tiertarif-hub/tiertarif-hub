import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MAX_ANCHOR_LOOKUP_MS = 5000;
const ANCHOR_LOOKUP_INTERVAL_MS = 100;

function getDecodedAnchorId(hash: string): string {
  const rawId = hash.replace(/^#/, "");

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
}

export function ScrollToAnchor() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const anchorId = getDecodedAnchorId(location.hash);
    if (!anchorId) return;

    let elapsedMs = 0;
    let intervalId: number | null = null;
    let rafId: number | null = null;

    const cleanup = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const scrollWhenReady = () => {
      const element = document.getElementById(anchorId);

      if (!element) {
        elapsedMs += ANCHOR_LOOKUP_INTERVAL_MS;

        if (elapsedMs >= MAX_ANCHOR_LOOKUP_MS) {
          cleanup();
        }

        return;
      }

      cleanup();
      rafId = window.requestAnimationFrame(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };

    scrollWhenReady();
    intervalId = window.setInterval(scrollWhenReady, ANCHOR_LOOKUP_INTERVAL_MS);

    return cleanup;
  }, [location.pathname, location.hash]);

  return null;
}
