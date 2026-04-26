import { useEffect, useRef } from "react";

export const TarifCheckCreditWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = "tarifcheck-kredit-script";
    
    // Clean up existing script to ensure reload on route change
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://form.partner-versicherung.de/widgets/199238/tcpp-iframe-kredit/kredit-iframe.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, []);

  return (
    <div className="w-full min-h-[800px] bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <div 
        ref={containerRef}
        style={{ width: "100%" }} 
        id="tcpp-iframe-kredit" 
        data-duration="12" 
        data-purpose="8" 
        data-amount="5000"
      ></div>
    </div>
  );
};