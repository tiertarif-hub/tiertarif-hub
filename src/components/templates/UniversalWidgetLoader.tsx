import { useEffect, useRef } from "react";
import MrMoneyWidget from "@/components/external/MrMoneyWidget";

interface UniversalWidgetLoaderProps {
  htmlCode?: string | null;
  widgetType?: string | null;
  widgetConfig?: Record<string, unknown> | null;
}

const HtmlWidgetLoader = ({ htmlCode }: { htmlCode?: string | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlCode) return;

    containerRef.current.innerHTML = "";

    const range = document.createRange();
    range.selectNodeContents(containerRef.current);
    const fragment = range.createContextualFragment(htmlCode);

    const scripts: HTMLScriptElement[] = [];

    fragment.querySelectorAll("script").forEach((origScript) => {
      const newScript = document.createElement("script");

      Array.from(origScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (origScript.innerHTML) {
        newScript.innerHTML = origScript.innerHTML;
      }

      scripts.push(newScript);
      origScript.remove();
    });

    containerRef.current.appendChild(fragment);

    scripts.forEach((script) => {
      document.body.appendChild(script);
    });

    return () => {
      scripts.forEach((script) => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
  }, [htmlCode]);

  return (
    <div
      ref={containerRef}
      className="universal-widget-wrapper w-full min-h-[500px] overflow-hidden rounded-xl bg-white"
    />
  );
};

export const UniversalWidgetLoader = ({ htmlCode, widgetType, widgetConfig }: UniversalWidgetLoaderProps) => {
  if (widgetType === "mr-money") {
    const sp = typeof widgetConfig?.sp === "string" ? widgetConfig.sp : "";
    return <MrMoneyWidget sp={sp} />;
  }

  if (widgetType === "html" || htmlCode) {
    return <HtmlWidgetLoader htmlCode={htmlCode} />;
  }

  return null;
};
