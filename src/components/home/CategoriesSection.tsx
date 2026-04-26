import { useCategories } from "@/hooks/useCategories";
import { useHomeContent } from "@/hooks/useSettings";
import { HomeComparisonSlider } from "@/components/home/HomeComparisonSlider";

export const CategoriesSection = () => {
  const { data: categories = [], isLoading: isCatsLoading } = useCategories();
  const { content } = useHomeContent();

  if (!content) return null;

  return (
    <HomeComparisonSlider
      categories={categories}
      isLoading={isCatsLoading}
      title={content.categories.title || "Vergleiche direkt öffnen"}
      subtitle={
        content.categories.subtitle ||
        "Wähle den passenden Vergleich und springe ohne Umweg direkt zur relevanten Übersicht."
      }
    />
  );
};
