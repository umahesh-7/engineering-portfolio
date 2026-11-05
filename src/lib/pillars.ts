/** Pillar vocabulary shared by server and client code without pulling Zod into client bundles. */
export const PILLARS = ["ui", "backend", "fullstack", "platform"] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_LABELS: Record<Pillar, string> = {
  ui: "UI engineering",
  backend: "Backend",
  fullstack: "Full-stack",
  platform: "Platform and operations",
};

export function isPillar(value: unknown): value is Pillar {
  return typeof value === "string" && (PILLARS as readonly string[]).includes(value);
}
