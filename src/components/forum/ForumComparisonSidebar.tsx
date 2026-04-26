import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useForumSidebarConfig } from "@/hooks/useSettings";
import { normalizeInternalLinkTarget } from "@/lib/routes";
import { ArrowRight } from "lucide-react";

type Props = {
  categoryId?: string | null;
  threadTitle?: string | null;
};

const KEYWORD_MATCHERS: Array<{ test: RegExp; slug: string }> = [
  { test: /hund|tier|op-versicherung hund|hundekranken/i, slug: "hundekrankenversicherung-vergleich" },
  { test: /strom|energie/i, slug: "stromvergleich" },
  { test: /gas/i, slug: "gasvergleich" },
  { test: /dsl|internet/i, slug: "dsl-vergleich-rank-scout" },
  { test: /rechtsschutz/i, slug: "rechtsschutzversicherung-vergleich" },
  { test: /hausrat/i, slug: "hausratversicherung-vergleich" },
  { test: /haftpflicht/i, slug: "haftpflichtversicherung-vergleich" },
  { test: /wohngebäude|gebäude|haus und grund/i, slug: "wohngebaeudeversicherung-vergleich" },
  { test: /kredit|baufinanz/i, slug: "kredit-vergleich" },
];

function getTeaser(category: Category) {
  const raw = category.description || category.meta_description || category.comparison_title || "Tarife und Leistungen übersichtlich prüfen.";
  return String(raw).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function ComparisonTextCard({ category, label }: { category: Category; label: string }) {
  return (
    <Link
      to={normalizeInternalLinkTarget(`/${category.slug}`)}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-orange-300 hover:bg-white hover:shadow-sm"
    >
      <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
        {label}
      </div>
      <h3 className="line-clamp-2 text-[15px] font-bold leading-5 text-slate-900 transition-colors group-hover:text-primary">
        {category.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
        {getTeaser(category)}
      </p>
      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors group-hover:text-orange-500">
        Zum Vergleich <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

export function ForumComparisonSidebar({ categoryId, threadTitle }: Props) {
  const { data: categories = [], isLoading } = useCategories(false);
  const config = useForumSidebarConfig();

  const typeSafe = useMemo(
    () => categories.filter((c) => c.is_active && ["comparison", "hub_overview"].includes(c.template)),
    [categories]
  );

  const contextual = useMemo(() => {
    if (categoryId) {
      const direct = typeSafe.find((c) => c.id === categoryId);
      if (direct) return [direct];
    }
    const title = String(threadTitle || "");
    const matches = KEYWORD_MATCHERS.filter((rule) => rule.test.test(title))
      .map((rule) => typeSafe.find((c) => c.slug === rule.slug))
      .filter(Boolean) as Category[];
    return matches.slice(0, 2);
  }, [categoryId, threadTitle, typeSafe]);

  const byIds = (ids: string[]) => ids.map((id) => typeSafe.find((c) => c.id === id)).filter(Boolean) as Category[];
  const hot = config.show_hot ? byIds(config.hot_comparison_ids) : [];
  const popular = config.show_popular ? byIds(config.popular_comparison_ids) : [];

  const randomPool = useMemo(() => {
    const excluded = new Set([...contextual, ...hot, ...popular].map((c) => c.id));
    return typeSafe.filter((c) => !excluded.has(c.id));
  }, [typeSafe, contextual, hot, popular]);

  const random = useMemo(() => {
    if (!config.show_random || config.random_count <= 0) return [];
    const pool = [...randomPool].sort((a, b) => a.slug.localeCompare(b.slug));
    return pool.slice(0, Math.min(config.random_count, 3));
  }, [randomPool, config.show_random, config.random_count]);

  const sections = [
    {
      title: config.hot_title || "Heiße Vergleiche",
      label: "Heiss",
      items: [...contextual, ...hot].filter((item, index, arr) => arr.findIndex((x) => x.id === item.id) === index).slice(0, 3),
    },
    {
      title: config.popular_title || "Beliebte Vergleiche",
      label: "Beliebt",
      items: popular.slice(0, 3),
    },
    {
      title: config.random_title || "Zufällige Vergleiche",
      label: "Mix",
      items: random,
    },
  ].filter((section) => section.items.length > 0);

  if (isLoading || sections.length === 0) return null;

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-t-4 border-[#0E1F53] px-4 pb-4 pt-3">
            <h3 className="text-lg font-bold text-[#0E1F53]">{section.title}</h3>
          </div>
          <div className="space-y-3 px-4 pb-4">
            {section.items.map((category) => (
              <ComparisonTextCard key={category.id} category={category} label={section.label} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
