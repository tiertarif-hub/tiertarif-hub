import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Bug, Handshake, CheckCircle2, Loader2, ArrowRight, Compass, Layers, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FadeIn } from "@/components/ui/FadeIn";
import { useForceSEO } from "@/hooks/useForceSEO";
import { buildAbsoluteSiteUrl } from "@/lib/routes";

export default function Contact() {
  const location = useLocation();
  const metaDescription = "Kontakt zu TierTarif: Hinweise senden, Partnerschaften anfragen oder Feedback zum Portal sachlich und direkt übermitteln.";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useForceSEO(metaDescription);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        type: "contact_form",
        status: "new",
        referrer: document.referrer || "direct"
      }]);

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Nachricht erfolgreich gesendet!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Senden der Nachricht.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Helmet key={location.pathname} prioritizeSeoTags defer={false}>
        <title>Kontakt & Partner werden | TierTarif</title>
        <meta key="description" name="description" content={metaDescription} />
        <link rel="canonical" href={buildAbsoluteSiteUrl("/kontakt")} />
        <meta property="og:title" content="Kontakt & Partner werden | TierTarif" />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-[#0A0F1C] pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0F1C]" />
           <div className="container mx-auto px-4 relative z-10 text-center">
              <FadeIn>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
                  Lass uns <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">sprechen.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Egal ob du Partner werden möchtest, Support benötigst oder einen Fehler gefunden hast – wir sind für dich da.
                </p>
              </FadeIn>
           </div>
        </section>

        <section className="container mx-auto px-4 -mt-16 pb-20 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Info Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-orange-400"><Handshake className="w-5 h-5"/> Partner werden</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Du möchtest dein Produkt in unseren Vergleichen listen? Wir bieten maßgeschneiderte Performance-Pakete.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-400"><MessageSquare className="w-5 h-5"/> Support</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Fragen zu unseren Inhalten oder technische Probleme? Unser Team hilft dir gerne weiter.
                      </p>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">E-Mail Kontakt</p>
                      <a href="mailto:kontakt@tiertarif.com" className="text-white hover:text-orange-400 transition-colors font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" /> kontakt@tiertarif.com
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formular */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-slate-100 shadow-2xl rounded-2xl overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    {isSuccess ? (
                      <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Nachricht gesendet!</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                          Vielen Dank für deine Anfrage. Unser Team hat den Eingang bestätigt und wird sich schnellstmöglich bei dir melden.
                        </p>
                        <Button onClick={() => { setIsSuccess(false); setFormData({name:"", email:"", subject:"", message:""}); }} variant="outline">
                          Neue Nachricht senden
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Dein Name *</Label>
                            <Input 
                              id="name" 
                              placeholder="Max Mustermann" 
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="bg-slate-50 border-slate-200 h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">E-Mail Adresse *</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="max@beispiel.de" 
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              className="bg-slate-50 border-slate-200 h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Worum geht es? *</Label>
                          <Select onValueChange={val => setFormData({...formData, subject: val})}>
                            <SelectTrigger className="bg-slate-50 border-slate-200 h-12">
                              <SelectValue placeholder="Bitte wähle ein Thema..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="partner">🤝 Partner werden / Werbung buchen</SelectItem>
                              <SelectItem value="support">🆘 Technischer Support</SelectItem>
                              <SelectItem value="bug">🐛 Bug / Fehler melden</SelectItem>
                              <SelectItem value="feedback">💡 Feedback & Anregungen</SelectItem>
                              <SelectItem value="other">📝 Sonstiges</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Deine Nachricht *</Label>
                          <Textarea 
                            id="message" 
                            placeholder="Wie können wir dir helfen?" 
                            rows={6}
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="bg-slate-50 border-slate-200 resize-none p-4"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <p className="text-xs text-slate-400">
                            Mit dem Absenden stimmst du unseren <a href="/datenschutz" className="underline hover:text-slate-600">Datenschutzbestimmungen</a> zu.
                          </p>
                          <Button type="submit" disabled={isSubmitting} className="bg-[#0A0F1C] hover:bg-slate-900 text-white h-12 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <SendIcon className="w-5 h-5 mr-2" />}
                            {isSubmitting ? "Sende..." : "Absenden"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              <Compass className="w-4 h-4 text-primary" />
              Mehr auf TierTarif
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-3">Wichtige Bereiche im Überblick</h2>
            <p className="text-slate-600 mb-6">Neben dem Kontaktbereich findest du auf TierTarif auch Informationen zur Methodik, zu Kategorien und zu unseren Vergleichsseiten.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/wie-wir-vergleichen" className="rounded-2xl border border-slate-200 p-5 transition-colors hover:border-primary hover:bg-slate-50">
                <ShieldCheck className="w-5 h-5 text-primary mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Wie wir vergleichen</div>
                <div className="text-sm text-slate-600">Methodik, Kennzeichnung und redaktionelle Einordnung transparent erklärt.</div>
              </Link>
              <Link to="/kategorien" className="rounded-2xl border border-slate-200 p-5 transition-colors hover:border-primary hover:bg-slate-50">
                <Layers className="w-5 h-5 text-primary mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Alle Kategorien</div>
                <div className="text-sm text-slate-600">Versicherungen, Finanzen, Energie, Internet, KI und weitere Themen im Überblick.</div>
              </Link>
              <Link to="/versicherungen" className="rounded-2xl border border-slate-200 p-5 transition-colors hover:border-primary hover:bg-slate-50">
                <ArrowRight className="w-5 h-5 text-primary mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Vergleiche ansehen</div>
                <div className="text-sm text-slate-600">Direkter Einstieg in Versicherungs- und Vergleichsseiten von TierTarif.</div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
