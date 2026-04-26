import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface C4FRegistrationProps {
  backgroundImage?: string;
}

interface C4FInstance {
  registerUser: () => void;
  getInitData: () => void;
  showError: (msg: unknown) => void;
  registerUserSuccess: (data: unknown) => void;
}

declare global {
  interface Window {
    C4fRegister: new (code: string | null, subid: string | null, extra: unknown) => C4FInstance;
    cfr: C4FInstance | null;
    jQuery: unknown;
    $: unknown;
  }
}

// BUGFIX: Safe error message extraction - prevents React Error #31
const safeToastError = (error: unknown): string => {
  if (typeof error === "string") {
    // Handle 505 error specifically
    if (error.includes("505") || error.toLowerCase().includes("not valid")) {
      return "Kein Produkt gewählt. Bitte Link prüfen.";
    }
    return error;
  }
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      const msg = (error as { message: string }).message;
      if (msg.includes("505") || msg.toLowerCase().includes("not valid")) {
        return "Kein Produkt gewählt. Bitte Link prüfen.";
      }
      return msg;
    }
    if ("code" in error && (error as { code: unknown }).code === 505) {
      return "Kein Produkt gewählt. Bitte Link prüfen.";
    }
    try {
      const str = JSON.stringify(error);
      if (str.includes("505")) {
        return "Kein Produkt gewählt. Bitte Link prüfen.";
      }
      return str;
    } catch {
      return "Ein unbekannter Fehler ist aufgetreten.";
    }
  }
  return "Ein unbekannter Fehler ist aufgetreten.";
};

const C4FRegistration = ({ 
  backgroundImage = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920&q=80"
}: C4FRegistrationProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [gender, setGender] = useState<string>("");
  const [genderSearch, setGenderSearch] = useState<string>("");
  const cfrRef = useRef<C4FInstance | null>(null);
  
  // Dynamic URL parameters for multi-product support
  const code = searchParams.get('code');
  const subid = searchParams.get('subid');

  // Generate data for selects
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 82 }, (_, i) => currentYear - 18 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "1", label: "Januar" },
    { value: "2", label: "Februar" },
    { value: "3", label: "März" },
    { value: "4", label: "April" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Dezember" },
  ];

  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(script);
      });
    };

    const initializeC4F = async () => {
      try {
        await loadScript("https://api.cash4flirt.com/js/jquery.min.js");
        await new Promise((r) => setTimeout(r, 100));
        await loadScript("https://api.cash4flirt.com/js/register.js");
        await new Promise((r) => setTimeout(r, 200));

        if (window.C4fRegister) {
          // Use dynamic code from URL parameters
          const cfr = new window.C4fRegister(code, subid, null);

          cfr.showError = (msg: unknown) => {
            const safeMsg = safeToastError(msg);
            toast({
              title: "Fehler",
              description: safeMsg,
              variant: "destructive",
            });
            setIsLoading(false);
          };

          cfr.registerUserSuccess = () => {
            toast({
              title: "Erfolgreich!",
              description: "Deine Registrierung war erfolgreich.",
            });
            navigate("/welcome");
          };

          cfrRef.current = cfr;
          window.cfr = cfr;
          cfr.getInitData();
          setScriptsLoaded(true);
        } else {
          throw new Error("C4fRegister class not found");
        }
      } catch (err) {
        console.error("Error loading C4F scripts:", err);
        toast({
          title: "Ladefehler",
          description: safeToastError(err),
          variant: "destructive",
        });
      }
    };

    initializeC4F();

    return () => {
      cfrRef.current = null;
    };
  }, [code, subid, navigate]);

  const handleRegister = async () => {
    setIsLoading(true);

    // Lead Capture - Fail-Safe
    try {
      const emailInput = document.getElementById("email") as HTMLInputElement;
      const email = emailInput?.value?.trim();

      if (email) {
        const { error } = await supabase.from("subscribers").insert({
          email: email,
          source_page: "c4f-direct-signup",
          is_active: true,
        });

        if (error) {
          console.warn("Lead capture skipped (may already exist):", error.message);
        } else {
          console.log("Lead captured successfully");
        }
      }
    } catch (err) {
      console.warn("Lead capture failed, continuing:", err);
    }

    // C4F API
    if (cfrRef.current) {
      cfrRef.current.registerUser();
    } else if (window.cfr) {
      window.cfr.registerUser();
    } else {
      toast({
        title: "Fehler",
        description: "Registrierung nicht verfügbar. Bitte lade die Seite neu.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const inputClassName =
    "flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

  const selectClassName =
    "flex h-11 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  // Gender button component
  const GenderButton = ({ 
    value, 
    selected, 
    onClick, 
    type 
  }: { 
    value: string; 
    selected: boolean; 
    onClick: () => void;
    type: 'male' | 'female';
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`w-10 h-10 flex items-center justify-center rounded transition-all ${
        selected 
          ? type === 'male' 
            ? 'bg-blue-500 text-white' 
            : 'bg-pink-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {type === 'male' ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM15.9 8.1C15.9 8.1 14.5 7 12 7C9.5 7 8.1 8.1 8.1 8.1L5 22H7.8L9 15L11 17V22H13V17L15 15L16.2 22H19L15.9 8.1Z"/>
        </svg>
      )}
    </button>
  );

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-lg mx-auto px-4 py-8 lg:ml-[10%] lg:mx-0">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Jetzt kostenlos registrieren
            </h1>
            <p className="text-gray-500 text-sm">
              und vielleicht noch heute mit deiner großen Liebe schreiben.
            </p>
          </div>

          <div className="space-y-4">
            {/* Benutzername */}
            <div>
              <label htmlFor="nick" className={labelClassName}>Benutzername *</label>
              <input
                type="text"
                id="nick"
                name="nick"
                required
                disabled={isLoading}
                className={inputClassName}
              />
              <div className="invalid-feedback"></div>
            </div>

            {/* Kennwort */}
            <div>
              <label htmlFor="pass" className={labelClassName}>Kennwort *</label>
              <input
                type="password"
                id="pass"
                name="pass"
                required
                disabled={isLoading}
                className={inputClassName}
              />
              <div className="invalid-feedback"></div>
            </div>

            {/* E-Mailadresse */}
            <div>
              <label htmlFor="email" className={labelClassName}>E-Mailadresse *</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={isLoading}
                className={inputClassName}
              />
              <div className="invalid-feedback"></div>
            </div>

            {/* Geburtstag */}
            <div>
              <label className={labelClassName}>Geburtstag *</label>
              <div className="grid grid-cols-3 gap-2">
                <select id="day" name="day" required disabled={isLoading} className={selectClassName}>
                  <option value="">Tag</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <select id="month" name="month" required disabled={isLoading} className={selectClassName}>
                  <option value="">Monat</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                <select id="year" name="year" required disabled={isLoading} className={selectClassName}>
                  <option value="">Jahr</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="invalid-feedback"></div>
            </div>

            {/* Hidden Country */}
            <input type="hidden" id="country" name="country" value="DE" />

            {/* Stadt */}
            <div>
              <label htmlFor="city" className={labelClassName}>Stadt *</label>
              <input
                type="text"
                id="city"
                name="city"
                required
                disabled={isLoading}
                className={inputClassName}
              />
              <div className="invalid-feedback"></div>
            </div>

            {/* Gender Selection with Icon Buttons */}
            <div className="flex items-center gap-8">
              {/* Ich bin */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Ich bin</span>
                <div className="flex gap-1">
                  <GenderButton
                    value="m"
                    type="male"
                    selected={gender === "m"}
                    onClick={() => setGender("m")}
                  />
                  <GenderButton
                    value="w"
                    type="female"
                    selected={gender === "w"}
                    onClick={() => setGender("w")}
                  />
                </div>
              </div>

              {/* Ich suche */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Ich suche</span>
                <div className="flex gap-1">
                  <GenderButton
                    value="m"
                    type="male"
                    selected={genderSearch === "m"}
                    onClick={() => setGenderSearch("m")}
                  />
                  <GenderButton
                    value="w"
                    type="female"
                    selected={genderSearch === "w"}
                    onClick={() => setGenderSearch("w")}
                  />
                </div>
              </div>
            </div>

            {/* Hidden selects for API - synced with state */}
            <select id="gender" name="gender" required value={gender} onChange={(e) => setGender(e.target.value)} className="hidden" aria-hidden="true">
              <option value=""></option>
              <option value="m">Mann</option>
              <option value="w">Frau</option>
            </select>
            <select id="gender_search" name="gender_search" required value={genderSearch} onChange={(e) => setGenderSearch(e.target.value)} className="hidden" aria-hidden="true">
              <option value=""></option>
              <option value="m">Mann</option>
              <option value="w">Frau</option>
            </select>

            <div className="invalid-feedback"></div>

            {/* AGB Checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="conditions"
                name="conditions"
                required
                disabled={isLoading}
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="conditions" className="text-sm text-gray-600 cursor-pointer">
                Ich akzeptiere{" "}
                <a href="/agb" className="text-blue-600 hover:underline">
                  AGB
                </a>{" "}
                /{" "}
                <a href="/datenschutz" className="text-blue-600 hover:underline">
                  Datenschutz
                </a>{" "}
                *
              </label>
            </div>
            <div className="invalid-feedback"></div>

            {/* Register Button */}
            <Button
              type="button"
              className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
              onClick={handleRegister}
              disabled={isLoading || !scriptsLoaded}
            >
              {isLoading ? "Registrierung läuft..." : scriptsLoaded ? "Kostenlos anmelden" : "Wird geladen..."}
            </Button>

            {!scriptsLoaded && (
              <p className="text-xs text-gray-400 text-center animate-pulse">
                Registrierung wird vorbereitet...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default C4FRegistration;
