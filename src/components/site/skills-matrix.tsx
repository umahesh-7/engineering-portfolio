import Link from "next/link";
import { findExperience } from "@/lib/content";
import type { Skill, SkillGroup } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const TIER_LABEL = {
  core: "Core",
  working: "Working",
  familiar: "Also familiar with",
} as const;

const TIER_HELP = {
  core: "Used in a summary or in the two most recent roles",
  working: "Evidenced in an earlier role",
  familiar: "Listed, without a role that evidences it",
} as const;

function evidence(skill: Skill): string {
  const roles = skill.roles.map((slug) => findExperience(slug)?.company).filter(Boolean);
  return roles.length ? `Evidence: ${[...new Set(roles)].join(", ")}` : "";
}

function SkillChip({ skill }: { skill: Skill }) {
  const title = evidence(skill);
  const href = skill.projects[0] ? `/projects/${skill.projects[0]}` : undefined;
  const className = cn(
    "rounded-md border px-2.5 py-1 text-sm",
    skill.tier === "core" && "border-primary/40 bg-accent/60 text-accent-foreground",
    skill.tier === "working" && "border-border bg-background",
    skill.tier === "familiar" && "border-border border-dashed text-muted-foreground",
  );
  if (href) {
    return (
      <Link
        href={href}
        title={title ? `${title}. Opens the related case study.` : "Opens the related case study"}
        className={cn(className, "hover:border-primary")}
      >
        {skill.name}
      </Link>
    );
  }
  return (
    <span title={title || undefined} className={className}>
      {skill.name}
    </span>
  );
}

export function SkillsMatrix({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="space-y-10">
      {groups.map((group) => {
        const core = group.skills.filter((skill) => skill.tier === "core");
        const working = group.skills.filter((skill) => skill.tier === "working");
        const familiar = group.skills.filter((skill) => skill.tier === "familiar");
        return (
          <section
            key={group.pillar}
            aria-labelledby={`skills-${group.pillar}`}
            className="grid gap-4 md:grid-cols-[12rem_1fr]"
          >
            <h3 id={`skills-${group.pillar}`} className="font-semibold text-lg tracking-tight">
              {group.pillar}
            </h3>
            <div className="space-y-4">
              {[
                { tier: "core" as const, items: core },
                { tier: "working" as const, items: working },
              ].map(({ tier, items }) =>
                items.length ? (
                  <div key={tier}>
                    <p
                      className="mb-2 font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]"
                      title={TIER_HELP[tier]}
                    >
                      {TIER_LABEL[tier]}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {items.map((skill) => (
                        <li key={skill.name}>
                          <SkillChip skill={skill} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
              {familiar.length ? (
                <details className="group">
                  <summary className="cursor-pointer font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em] hover:text-foreground">
                    {TIER_LABEL.familiar} ({familiar.length})
                  </summary>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {familiar.map((skill) => (
                      <li key={skill.name}>
                        <SkillChip skill={skill} />
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </section>
        );
      })}
      <p className="text-muted-foreground text-xs">
        Tiers are inferred from the source documents: core skills appear in a summary or in the two
        most recent roles, working skills are evidenced in an earlier role, and the collapsed row
        lists technologies without a role that evidences them.
      </p>
    </div>
  );
}
