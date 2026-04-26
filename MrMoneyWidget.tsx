import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MrMoneyWidgetProps {
  sp: string;
}

const MR_MONEY_SCRIPT_ID = "mr-money-iframe-controls";
const MR_MONEY_SCRIPT_SRC = "https://www.mr-money.de/iframeControls.js";
const MR_MONEY_IFRAME_ID = "mrmoFrame";
const MR_MONEY_PARTNER_ID = "ranksct";

let mrMoneyScriptPromise: Promise<void> | null = null;

const loadMrMoneyScript = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (mrMoneyScriptPromise) {
    return mrMoneyScriptPromise;
  }

  mrMoneyScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(MR_MONEY_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Mr. Money Script konnte nicht geladen werden.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MR_MONEY_SCRIPT_ID;
    script.src = MR_MONEY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Mr. Money Script konnte nicht geladen werden."));

    document.body.appendChild(script);
  }).catch((error) => {
    mrMoneyScriptPromise = null;
    throw error;
  });

  return mrMoneyScriptPromise;
};

export const MrMoneyWidget = ({ sp }: MrMoneyWidgetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isIframeSized, setIsIframeSized] = useState(false);
  const [hasError, setHasError] = useState(false);

  const normalizedSp = useMemo(() => String(sp ?? "").trim().toLowerCase(), [sp]);
  const iframeSrc = useMemo(() => {
    if (!normalizedSp) return "";
    return `https://www.mr-money.de/cookievgl.php?sp=${encodeURIComponent(normalizedSp)}&id=${MR_MONEY_PARTNER_ID}`;
  }, [normalizedSp]);

  useEffect(() => {
    let isMounted = true;

    setIsScriptReady(false);
    setHasError(false);
    setIsIframeSized(false);

    if (!normalizedSp) {
      setHasError(true);
      return;
    }

    window.mrmoScrollToViewport = 1;
    window.mrmoScrollToViewportOffset = -20;

    loadMrMoneyScript()
      .then(() => {
        if (!isMounted) return;
        setIsScriptReady(true);
      })
      .catch((error) => {
        console.error("Mr. Money Script-Fehler:", error);
        if (!isMounted) return;
        setHasError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedSp]);

  useEffect(() => {
    if (!isScriptReady || !iframeRef.current) {
      return;
    }

    const iframe = iframeRef.current;
    const wrapper = wrapperRef.current;

    const markSized = () => {
      const iframeHeight = iframe.getBoundingClientRect().height;
      const wrapperHeight = wrapper?.getBoundingClientRect().height ?? 0;

      if (iframeHeight > 250 || wrapperHeight > 250) {
        setIsIframeSized(true);
      }
    };

    markSized();

    const intervalId = window.setInterval(markSized, 300);
    const timeoutId = window.setTimeout(() => {
      setIsIframeSized(true);
    }, 4000);

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        markSized();
      });

      resizeObserver.observe(iframe);
      if (wrapper) {
        resizeObserver.observe(wrapper);
      }
    }

    iframe.addEventListener("load", markSized);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      iframe.removeEventListener("load", markSized);
      resizeObserver?.disconnect();
    };
  }, [iframeSrc, isScriptReady]);

  if (hasError || !normalizedSp) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
        Der Mr.-Money-Rechner konnte gerade nicht geladen werden.
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative w-full overflow-hidden rounded-3xl bg-white">
      {!isIframeSized && (
        <div className="absolute inset-0 z-10 flex flex-col gap-4 bg-white/92 px-4 py-6 backdrop-blur-[1px]">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-2/3 rounded-2xl" />
          <Skeleton className="h-[520px] w-full rounded-2xl" />
        </div>
      )}

      <iframe
        key={iframeSrc}
        ref={iframeRef}
        id={MR_MONEY_IFRAME_ID}
        title={`Mr. Money Vergleichsrechner ${normalizedSp}`}
        src={iframeSrc}
        loading="lazy"
        className="block w-full min-h-[760px] border-0 bg-white"
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default MrMoneyWidget;
