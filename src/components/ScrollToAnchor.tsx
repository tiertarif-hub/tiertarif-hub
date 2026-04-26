import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToAnchor() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Wir entfernen das # um die ID zu bekommen
      const id = location.hash.slice(1);
      
      // Wir versuchen es mehrfach (Polling), da die Inhalte aus der DB geladen werden
      // und beim ersten Versuch vielleicht noch nicht da sind.
      let retries = 0;
      
      const intervalId = setInterval(() => {
        const element = document.getElementById(id);
        
        if (element) {
          // Element gefunden! Scrollen.
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          clearInterval(intervalId); // Job erledigt, aufhören zu suchen.
        }
        
        retries++;
        // Wir suchen ca. 5 Sekunden lang (50 * 100ms), dann geben wir auf.
        if (retries > 50) {
          clearInterval(intervalId);
        }
      }, 100);

      // Aufräumen, wenn die Komponente entladen wird
      return () => clearInterval(intervalId);
    }
  }, [location]); // Feuert bei jeder Änderung (Pfad oder Hash)

  return null;
}