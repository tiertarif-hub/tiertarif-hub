import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Seite nicht gefunden | TierTarif</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-9xl font-black text-slate-200">404</h1>
          <p className="mb-6 text-2xl font-bold text-slate-900">Hoppla! Seite nicht gefunden.</p>
          <p className="mb-8 text-slate-500">
            Die Seite, nach der du suchst, existiert nicht oder wurde verschoben.
          </p>
          <Button asChild className="bg-[#0A0F1C] hover:bg-orange-500 text-white transition-colors h-12 px-8 rounded-xl font-bold">
            <Link to="/">Zurück zur Startseite</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFound;