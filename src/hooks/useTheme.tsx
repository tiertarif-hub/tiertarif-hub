import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ColorTheme = "dark" | "light" | "neon";

interface ThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = "dark" 
}: { 
  children: ReactNode; 
  defaultTheme?: ColorTheme;
}) {
  const [theme, setTheme] = useState<ColorTheme>(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("theme-dark", "theme-light", "theme-neon");
    
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Hook to get theme from category
export function useCategoryTheme(categoryColorTheme?: string | null): ColorTheme {
  if (categoryColorTheme === "light") return "light";
  if (categoryColorTheme === "neon") return "neon";
  return "dark";
}
