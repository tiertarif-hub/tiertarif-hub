import { Zap, BarChart3, Globe, Lock } from "lucide-react";
import { useHomeContent } from "@/hooks/useSettings";

export const SEOContentSection = () => {
  const { content } = useHomeContent();
  
  if (!content) return null;

  const features = content.why_us?.features || [
    { title: "Schnelle Übersicht", text: "Keine Ladezeiten, nur Fakten.", icon: "zap" },
    { title: "Redaktionell aufbereitet", text: "Übersichtlich dargestellt.", icon: "shield" },
    { title: "Global & Lokal", text: "Von International bis Regional.", icon: "globe" },
    { title: "Regelmäßige Updates", text: "Regelmäßig aktualisiert.", icon: "chart" }
  ];

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-6">
            {content.why_us?.headline || "Warum dieses Portal?"}
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            {content.why_us?.subheadline || "Wir bieten dir eine strukturierte Übersicht über Vergleiche und Ratgeber."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white p-10 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Zap className="w-64 h-64 text-secondary" strokeWidth={1.5} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-500 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-3">{features[0]?.title}</h3>
                <p className="text-slate-500 max-w-md">{features[0]?.text}</p>
              </div>
            </div>
          </div>

          <div className="md:row-span-2 group relative overflow-hidden rounded-3xl bg-primary p-10 shadow-lg border border-primary/50 flex flex-col justify-between">
            
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
                    alt="Secure Technology Background" 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-50 transition-all duration-[3s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
            </div>

            <div className="relative z-10">
               <div className="p-3 w-fit rounded-xl bg-white/10 text-white mb-6 border border-white/10 backdrop-blur-md">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{features[1]?.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm drop-shadow-md font-medium">
                {features[1]?.text}
              </p>
            </div>

            <div className="relative mt-8 h-48 w-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm flex items-center justify-center group-hover:border-secondary/30 transition-colors shadow-2xl">
               <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_20px_#4ade80] z-20" 
                   style={{ animation: 'scan 3s ease-in-out infinite' }} />
               <div className="absolute bottom-4 z-30 flex items-center gap-2 px-3 py-1 bg-black/60 rounded-full border border-green-500/30 backdrop-blur-xl shadow-lg">
                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold text-green-300 tracking-wider">TRANSPARENT</span>
               </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-500 flex flex-col">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{features[2]?.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{features[2]?.text}</p>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-500 flex flex-col">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{features[3]?.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{features[3]?.text}</p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
      `}</style>
    </section>
  );
};