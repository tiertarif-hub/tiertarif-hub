import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const { signIn, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  if (user && !authLoading) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        toast({
          title: "Fehler",
          description: error.message || "Anmeldung fehlgeschlagen",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Angemeldet",
        description: "Willkommen zurück!",
      });

      navigate("/admin");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur border-border">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#0E1F53]">
              <Search className="w-5 h-5 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
          <CardDescription>Melde dich mit Supabase Auth an, um das Portal zu verwalten.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register("email")}
                className="bg-muted/50"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="bg-muted/50"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0E1F53] text-white hover:bg-[#16306f]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Bitte warten...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Zurück zur Startseite
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}