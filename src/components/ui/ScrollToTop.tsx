import { useState, useEffect, forwardRef } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScrollToTop = forwardRef<HTMLDivElement>((_, ref) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Button erscheint erst nach 400px Scroll-Tiefe
      setShow(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div 
      ref={ref}
      // ÄNDERUNG: Von right-6 auf left-6 verschoben
      className={`fixed bottom-6 left-6 z-40 transition-all duration-500 ${show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
    >
      <Button 
        onClick={scrollToTop}
        // DESIGN: bg-primary (Navy) und text-secondary (Orange)
        className="h-12 w-12 rounded-full bg-primary text-secondary border border-white/10 shadow-xl hover:bg-primary/90 hover:-translate-y-1 transition-all"
        aria-label="Nach oben scrollen"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
    </div>
  );
});

ScrollToTop.displayName = "ScrollToTop";
