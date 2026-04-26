import { useParams } from "react-router-dom";
import About from "./About";
import CategoryDetail from "./CategoryDetail";
import { useSettings } from "@/hooks/useSettings";
import { ABOUT_PAGE_SETTING_KEY, normalizeAboutPageContent, normalizeAboutSlug } from "@/lib/aboutContent";

export default function AboutOrCategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: settings } = useSettings();
  const aboutContent = normalizeAboutPageContent(settings?.[ABOUT_PAGE_SETTING_KEY]);
  const currentSlug = normalizeAboutSlug(slug);
  const aboutSlug = normalizeAboutSlug(aboutContent.slug);

  if (currentSlug === aboutSlug) {
    return <About />;
  }

  return <CategoryDetail />;
}
