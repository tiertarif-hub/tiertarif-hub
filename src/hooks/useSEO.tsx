import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

/**
 * Hook that dynamically updates document.title and meta description
 * based on settings from the database.
 * 
 * Use this hook in your main layout or App component to ensure
 * SEO tags are always in sync with admin settings.
 */
export function useSEO() {
  const { data: settings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading || !settings) return;

    // Update document title
    const siteTitle = settings.site_title as string;
    if (siteTitle) {
      document.title = siteTitle;
    }

    // Update meta description
    const siteDescription = settings.site_description as string;
    if (siteDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", siteDescription);
    }
  }, [settings, isLoading]);

  return { settings, isLoading };
}

/**
 * Hook for page-specific SEO that overrides global settings
 */
export function usePageSEO(title?: string, description?: string) {
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute("content");

    if (title) {
      document.title = title;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    // Cleanup: restore original on unmount
    return () => {
      if (originalTitle) {
        document.title = originalTitle;
      }
      if (originalDescription) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute("content", originalDescription);
        }
      }
    };
  }, [title, description]);
}
