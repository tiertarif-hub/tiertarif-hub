import { useEffect, useRef } from "react";

export const Check24PowerWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = "check24-power-script";
    
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://files.check24.net/widgets/auto/1167193/c24pp-power-iframe/power-iframe.js";
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
        id="c24pp-power-iframe" 
        data-scrollto="begin"
      ></div>
    </div>
  );
};