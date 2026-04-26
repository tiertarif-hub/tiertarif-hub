import "@/styles/article-content.css";
import { useMemo } from "react";
import ProjectListEmbed from "./ProjectListEmbed";
import type { Category } from "@/hooks/useCategories";
import type { ProjectWithCategory } from "@/hooks/useProjects";
import { sanitizeCmsHtml } from "@/lib/sanitizeHtml";

interface CustomHtmlRendererProps {
  category: Category;
  projects: ProjectWithCategory[];
  htmlContent: string;
}

const CONTENT_PROSE_CLASSNAME =
  "custom-html-content article-content article-content--brand max-w-none";

export default function CustomHtmlRenderer({
  category,
  projects,
  htmlContent,
}: CustomHtmlRendererProps) {
  const { beforeApps, afterApps, hasPlaceholder } = useMemo(() => {
    const placeholder = "{{APPS}}";
    const index = htmlContent.indexOf(placeholder);

    if (index === -1) {
      return {
        beforeApps: htmlContent,
        afterApps: "",
        hasPlaceholder: false,
      };
    }

    return {
      beforeApps: htmlContent.substring(0, index),
      afterApps: htmlContent.substring(index + placeholder.length),
      hasPlaceholder: true,
    };
  }, [htmlContent]);

  return (
    <div className="custom-html-override w-full m-0 p-0">
      {beforeApps && (
        <article
          className={CONTENT_PROSE_CLASSNAME}
          dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(beforeApps) }}
        />
      )}

      {hasPlaceholder && (
        <ProjectListEmbed
          projects={projects}
          categoryName={category.name}
          theme={category.theme}
        />
      )}

      {afterApps && (
        <article
          className={CONTENT_PROSE_CLASSNAME}
          dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(afterApps) }}
        />
      )}

      {!hasPlaceholder && projects.length > 0 && (
        <ProjectListEmbed
          projects={projects}
          categoryName={category.name}
          theme={category.theme}
        />
      )}
    </div>
  );
}
