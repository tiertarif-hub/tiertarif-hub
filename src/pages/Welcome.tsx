import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Welcome = () => {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center shadow-glow-primary border-border/50 animate-fade-in">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Success Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-primary-gradient p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-gradient-primary flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Willkommen!
              <Sparkles className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-xl text-foreground font-medium">
              Deine Registrierung war erfolgreich!
            </p>
          </div>

          {/* Message */}
          <div className="space-y-3 text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-dating" />
              Viel Spaß beim Flirten!
            </p>
            <p className="text-sm">
              Du kannst dich jetzt mit deinen Zugangsdaten auf der Partner-Plattform anmelden.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full bg-primary-gradient hover:opacity-90">
              <Link to="/">
                Zurück zur Startseite
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/kategorien">
                Mehr Portale entdecken
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
