import { ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOpenApiDocument } from "@/lib/openapi";

export const metadata: Metadata = {
  title: "API documentation",
  description:
    "OpenAPI 3.1 documentation for the portfolio's read-only JSON API: case studies, view counts, GitHub activity and health.",
  alternates: { canonical: "/api/docs" },
};

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  description?: string;
  format?: string;
  anyOf?: JsonSchema[];
};

type Operation = {
  tags?: readonly string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: readonly { name: string; in: string; required?: boolean; description?: string }[];
  responses: Record<string, { description: string }>;
};

function typeLabel(schema: JsonSchema): string {
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (schema.anyOf) return schema.anyOf.map(typeLabel).join(" | ");
  if (schema.type === "array" && schema.items) return `${typeLabel(schema.items)}[]`;
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  return schema.type ?? "object";
}

function SchemaTable({ name, schema }: { name: string; schema: JsonSchema }) {
  const properties = Object.entries(schema.properties ?? {});
  const required = new Set(schema.required ?? []);
  return (
    <section aria-labelledby={`schema-${name}`} className="rounded-xl border border-border bg-card">
      <h3
        id={`schema-${name}`}
        className="border-border border-b px-4 py-3 font-mono font-semibold text-sm"
      >
        {name}
      </h3>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2 font-medium">Field</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(([field, value]) => (
            <tr key={field} className="border-border border-t align-top">
              <td className="px-4 py-2 font-mono text-xs">
                {field}
                {required.has(field) ? (
                  <span className="ml-1 text-destructive" title="required">
                    *
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-2 font-mono text-muted-foreground text-xs">
                {typeLabel(value)}
              </td>
              <td className="px-4 py-2 text-muted-foreground text-xs">
                {value.description ??
                  (value.properties ? `${Object.keys(value.properties).length} fields` : "")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function ApiDocsPage() {
  const doc = getOpenApiDocument();
  const paths = Object.entries(doc.paths) as [string, Record<string, Operation>][];
  const schemas = Object.entries(doc.components.schemas) as [string, JsonSchema][];

  return (
    <Container className="py-12 lg:py-16">
      <p className="font-medium font-mono text-primary text-xs uppercase tracking-[0.2em]">API</p>
      <h1 className="mt-4 font-semibold text-headline tracking-tight">{doc.info.title}</h1>
      <p className="mt-4 max-w-3xl text-pretty text-muted-foreground">{doc.info.description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <a href="/api/v1/openapi.json">
            OpenAPI 3.1 document
            <ExternalLinkIcon aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="/api/v1/projects">Try the projects endpoint</a>
        </Button>
      </div>

      <h2 className="mt-14 font-semibold text-title tracking-tight">Endpoints</h2>
      <div className="mt-6 space-y-6">
        {paths.map(([path, operations]) =>
          Object.entries(operations).map(([method, operation]) => (
            <article
              key={`${method} ${path}`}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant={method === "get" ? "secondary" : "default"}
                  className="font-mono uppercase"
                >
                  {method}
                </Badge>
                <code className="font-mono text-sm">{path}</code>
                {operation.tags?.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 font-medium">{operation.summary}</p>
              {operation.description ? (
                <p className="mt-1 text-muted-foreground text-sm">{operation.description}</p>
              ) : null}
              {operation.parameters?.length ? (
                <dl className="mt-3 text-sm">
                  {operation.parameters.map((parameter) => (
                    <div key={parameter.name} className="flex gap-2">
                      <dt className="font-mono text-xs">
                        {parameter.name}{" "}
                        <span className="text-muted-foreground">({parameter.in})</span>
                      </dt>
                      <dd className="text-muted-foreground text-xs">{parameter.description}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                {Object.entries(operation.responses).map(([code, response]) => (
                  <li key={code} className="rounded-md border border-border px-2 py-1">
                    <span className="font-mono">{code}</span>{" "}
                    <span className="text-muted-foreground">{response.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          )),
        )}
      </div>

      <h2 className="mt-14 font-semibold text-title tracking-tight">Schemas</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {schemas.map(([name, schema]) => (
          <SchemaTable key={name} name={name} schema={schema} />
        ))}
      </div>
    </Container>
  );
}
