import { Link } from "react-router-dom";
import { Gamepad2, Trophy, Zap, Ghost, Crosshair, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ArcadeSection = () => {
  const games = [
    {
      id: 1,
      title: "Rank Racer",
      desc: "Highspeed SEO Racing",
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      color: "from-yellow-400/20 to-orange-500/20",
      border: "hover:border-yellow-400/50"
    },
    {
      id: 2,
      title: "Keyword Crush",
      desc: "Match & Win",
      icon: <Trophy className="w-8 h-8 text-purple-400" />,
      color: "from-purple-400/20 to-pink-500/20",
      border: "hover:border-purple-400/50"
    },
    {
      id: 3,
      title: "Data Defense",
      desc: "Protect the Core",
      icon: <Crosshair className="w-8 h-8 text-cyan-400" />,
      color: "from-cyan-400/20 to-blue-500/20",
      border: "hover:border-cyan-400/50"
    },
    {
      id: 4,
      title: "Ghost Writer",
      desc: "Catch the Trends",
      icon: <Ghost className="w-8 h-8 text-emerald-400" />,
      color: "from-emerald-400/20 to-green-500/20",
      border: "hover:border-emerald-400/50"
    }
  ];

  return (
    // Floating Island Design
    <section className="py-20 my-12 mx-4 md:mx-8 bg-primary rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-primary/20">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg')] opacity-5 mix-blend-overlay bg-cover bg-center"></div>
        <div className="absolute -right-20 top-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-10 top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
                    <Gamepad2 className="w-3 h-3" /> Arcade Lounge
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                    Play to <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-400">Rank</span>.
                </h2>
                <p className="text-slate-400 mt-4 text-lg">
                    Fordere die Community heraus. Sammle Brain-Points und klettere im Leaderboard.
                </p>
            </div>
            
            <Link to="/arcade">
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/20 rounded-full px-8 py-6 text-lg transition-all">
                    Zur Arcade Lounge
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <div 
              key={game.id}
              className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-2 ${game.border}`}
            >
              {/* Gradient BG on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 p-3 bg-white/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                <p className="text-slate-400 text-sm">{game.desc}</p>
                
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-xs font-mono text-secondary">TOP SCORE: 9.850</span>
                    <Button size="sm" className="bg-white/10 hover:bg-white text-white hover:text-primary rounded-full w-8 h-8 p-0">
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};