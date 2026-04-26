import { useHomeContent } from "@/hooks/useSettings";
import { BookOpenTextIcon, ScaleIcon, ActivityIcon } from "lucide-react";

export const TrustSection = () => {
  const { content } = useHomeContent();
  
  const trust = content?.trust || {};

  const headline = trust.headline || "Vergleiche, Rechner und Ratgeber im Überblick";
  const description = trust.subheadline || "Wir strukturieren Vergleiche, Rechner und Ratgeber verständlich und fortlaufend.";

  const values = [
    { title: "Redaktionelle Inhalte", icon: BookOpenTextIcon },
    { title: "Transparente Kriterien", icon: ScaleIcon },
    { title: "Fortlaufend gepflegt", icon: ActivityIcon },
  ];

  return (
    <section className="pt-24 pb-0 relative overflow-hidden bg-white border-b border-slate-100">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            Transparente Vergleiche & Redaktionelle Inhalte
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
            {headline}
          </h2>
          
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </div>

      <div className="py-10 border-t border-slate-100 bg-slate-50/50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-slate-700">
                    {val.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};