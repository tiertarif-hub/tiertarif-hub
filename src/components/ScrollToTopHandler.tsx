import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

type BrowserNavigationType = "navigate" | "reload" | "back_forward" | "prerender" | "unknown";

const getBrowserNavigationType = (): BrowserNavigationType => {
  if (typeof window === "undefined") return "unknown";

  const navigationEntries = window.performance?.getEntriesByType?.("navigation") as
    | PerformanceNavigationTiming[]
    | undefined;

  if (navigationEntries && navigationEntries.length > 0) {
    return navigationEntries[0].type;
  }

  const legacyNavigation = (window.performance as Performance & {
    navigation?: { type?: number };
  })?.navigation;

  switch (legacyNavigation?.type) {
    case 0:
      return "navigate";
    case 1:
      return "reload";
    case 2:
      return "back_forward";
    default:
      return "unknown";
  }
};

export const ScrollToTopHandler = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  const isRestoring = useRef(false);
  const hasRestored = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const handleClick = () => {
      sessionStorage.setItem(`scroll-pos-${pathname}`, window.scrollY.toString());
    };

    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  useEffect(() => {
    if (hash) {
      return;
    }

    const storageKey = `scroll-pos-${pathname}`;
    const browserNavigationType = getBrowserNavigationType();
    const isInitialDocumentLoad = isFirstRender.current;

    if (isInitialDocumentLoad) {
      isFirstRender.current = false;
    }

    if (isInitialDocumentLoad && browserNavigationType === "reload") {
      sessionStorage.removeItem(storageKey);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    if (isInitialDocumentLoad && browserNavigationType === "navigate") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    if (navigationType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const savedPos = sessionStorage.getItem(storageKey);
    const yTarget = savedPos ? parseInt(savedPos, 10) : 0;

    if (!Number.isFinite(yTarget) || yTarget <= 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    isRestoring.current = true;
    hasRestored.current = false;

    let timeoutId: number | null = null;
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const cleanup = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      isRestoring.current = false;
    };

    const attemptRestore = () => {
      if (hasRestored.current) return;

      const root = document.documentElement;
      const maxScrollableTop = Math.max(root.scrollHeight - window.innerHeight, 0);

      if (maxScrollableTop + 8 < yTarget) {
        return;
      }

      window.scrollTo({ top: yTarget, left: 0, behavior: "auto" });

      if (Math.abs(window.scrollY - yTarget) <= 12) {
        hasRestored.current = true;
        cleanup();
      }
    };

    animationFrameId = window.requestAnimationFrame(attemptRestore);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        attemptRestore();
      });

      resizeObserver.observe(document.documentElement);

      if (document.body) {
        resizeObserver.observe(document.body);
      }
    } else {
      mutationObserver = new MutationObserver(() => {
        attemptRestore();
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    timeoutId = window.setTimeout(() => {
      cleanup();
    }, 3500);

    return cleanup;
  }, [pathname, hash, navigationType]);

  return null;
};
