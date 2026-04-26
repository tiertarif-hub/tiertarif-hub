import "@/styles/article-content.css";
import React from 'react';

interface ExportTemplateProps {
  title: string;
  description: string;
  content: string; // HTML Content
  type: "COMPARISON" | "ARTICLE";
  projects?: any[]; // Für Vergleiche
  siteName: string;
  year: number;
}

export const ExportTemplate: React.FC<ExportTemplateProps> = ({
  title,
  description,
  content,
  type,
  projects = [],
  siteName,
  year
}) => {
  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        
        {/* Tailwind CDN - Styling ohne Build-Step auf fremden Servern */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* FontAwesome Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    display: ['Outfit', 'sans-serif'],
                  },
                  colors: {
                    primary: '#030E3E', // Dein Navy Blau
                    secondary: '#FF4C29', // Dein Orange
                    accent: '#FBBF24', // Gold für Ratings
                    background: '#ffffff',
                  }
                }
              }
            }
          `
        }} />
        <style dangerouslySetInnerHTML={{
            __html: `
                body {
                    background-color: #ffffff;
                    /* Dein Tech-Grid Effekt */
                    background-image: radial-gradient(#030E3E 0.5px, transparent 0.5px);
                    background-size: 20px 20px;
                    background-attachment: fixed;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(3, 14, 62, 0.05);
                }
            `
        }} />
      </head>
      <body className="text-slate-900 font-sans antialiased min-h-screen flex flex-col">
        
        {/* HEADER */}
        <header className="bg-primary text-white py-4 shadow-lg sticky top-0 z-50 border-b border-white/10">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center font-display font-bold text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                {siteName.charAt(0)}
              </div>
              <span className="font-display font-bold text-xl tracking-tight">{siteName}</span>
            </a>
            <a href="#vergleich" className="bg-secondary hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-all text-sm shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5">
              Zum Vergleich
            </a>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="bg-primary pt-20 pb-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-transparent to-primary/90 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-secondary text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                    <i className="fas fa-shield-alt"></i> Offizieller Vergleich {year}
                </span>
                <h1 className="font-display font-bold text-4xl md:text-6xl text-white mb-6 leading-tight max-w-4xl mx-auto drop-shadow-xl">
                    {title}
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                    {description}
                </p>
            </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="container mx-auto px-4 -mt-20 relative z-20 pb-20 flex-grow">
            
            {/* 1. COMPARISON TABLE */}
            {type === "COMPARISON" && projects.length > 0 && (
                <div id="vergleich" className="glass-card rounded-2xl shadow-2xl overflow-hidden mb-16 ring-1 ring-black/5">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="font-display font-bold text-xl text-primary flex items-center gap-2">
                            <i className="fas fa-list-ol text-secondary"></i> Top Anbieter
                        </h2>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Aktualisiert: Heute
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {projects.map((project, index) => (
                            <div key={index} className={`p-6 transition-colors hover:bg-slate-50/50 ${index === 0 ? 'bg-orange-50/10' : ''}`}>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    
                                    {/* Rank */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white ring-4 ring-orange-100' : 'bg-slate-100 text-slate-500'}`}>
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                                        {project.logo_url ? (
                                            <img src={project.logo_url} alt={project.name} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="font-bold text-slate-300">{project.name}</span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 text-center md:text-left min-w-0">
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-primary truncate">{project.name}</h3>
                                            {index === 0 && <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded shadow-sm shadow-orange-500/20 uppercase tracking-wide">Sieger</span>}
                                        </div>
                                        
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-700">
                                                <i className="fas fa-shield-alt"></i>
                                                {project.badge_text || (index === 0 ? 'Top-Empfehlung' : 'Beliebt')}
                                            </span>
                                        </div>

                                        {project.features && (
                                            <div className="hidden md:flex flex-wrap gap-2">
                                                {Array.isArray(project.features) && project.features.slice(0, 3).map((f: string, i: number) => (
                                                    <span key={i} className="text-[11px] font-medium text-slate-600 bg-white border border-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                                                        <i className="fas fa-check text-green-500 text-[9px]"></i> {f}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-2">
                                        <a 
                                            href={project.affiliate_link || '#'} 
                                            target="_blank" 
                                            rel="nofollow noreferrer"
                                            className={`block w-full md:w-auto px-8 py-3.5 rounded-lg font-bold text-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${index === 0 ? 'bg-secondary text-white hover:bg-orange-600 shadow-orange-500/20' : 'bg-primary text-white hover:bg-blue-900 shadow-blue-900/10'}`}
                                        >
                                            Zum Angebot <i className="fas fa-chevron-right ml-1 text-xs opacity-70"></i>
                                        </a>
                                        {project.badge_text && (
                                            <span className="text-[10px] text-center text-slate-400 font-medium block">{project.badge_text}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. SEO CONTENT ARTICLE */}
            <article className="glass-card article-content article-content--brand article-content--lg rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </article>

        </main>

        {/* FOOTER */}
        <footer className="bg-primary text-white py-12 text-center border-t border-white/10 mt-auto">
            <div className="container mx-auto px-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-display font-bold text-white mx-auto mb-6">
                    {siteName.charAt(0)}
                </div>
                <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm font-medium text-slate-300">
                    <a href="/impressum/" className="hover:text-white transition-colors">Impressum</a>
                    <a href="/datenschutz/" className="hover:text-white transition-colors">Datenschutz</a>
                    <a href="/kontakt/" className="hover:text-white transition-colors">Kontakt</a>
                </div>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-8"></div>
                <p className="text-slate-400 text-sm mb-4">&copy; {year} {siteName}. Alle Rechte vorbehalten.</p>
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    *Werbehinweis: Wir finanzieren uns über Affiliate-Links. Wenn Sie über Links auf dieser Seite einkaufen, erhalten wir möglicherweise eine Provision. Für Sie entstehen keine Mehrkosten.
                </p>
            </div>
        </footer>

      </body>
    </html>
  );
};