import { Helmet } from "react-helmet-async";
import { sanitizeJsonForScript } from "@/lib/seo";

type JsonLdSchema = Record<string, unknown>;

type SchemaInjectorProps = {
  schemas?: Array<JsonLdSchema | null | undefined | false>;
};

type RawJsonLdProps = {
  json: string;
};

function normalizeJson(json: string): string {
  return String(json || "").trim();
}

export function RawJsonLd({ json }: RawJsonLdProps) {
  const normalizedJson = normalizeJson(json);
  if (!normalizedJson) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: normalizedJson }}
    />
  );
}

export function SchemaInjector({ schemas = [] }: SchemaInjectorProps) {
  const normalizedSchemas = schemas.filter(
    (schema): schema is JsonLdSchema => Boolean(schema) && typeof schema === "object",
  );

  if (normalizedSchemas.length === 0) {
    return null;
  }

  return (
    <Helmet>
      {normalizedSchemas.map((schema, index) => (
        <RawJsonLd
          key={`jsonld-${index}`}
          json={sanitizeJsonForScript(schema)}
        />
      ))}
    </Helmet>
  );
}
