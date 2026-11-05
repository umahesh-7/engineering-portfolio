import { BriefcaseIcon, GraduationCapIcon } from "lucide-react";
import { openBullets } from "@/lib/content";
import { formatDuration } from "@/lib/dates";
import type { Education, Experience } from "@/lib/schemas";
import { formatMonth } from "@/lib/utils";

type Entry =
  | { kind: "role"; start: string; role: Experience }
  | { kind: "education"; start: string; education: Education };

export function Timeline({
  experience,
  education,
  view = "about",
}: {
  experience: Experience[];
  education: Education[];
  view?: "about" | "resume";
}) {
  const entries: Entry[] = [
    ...experience.map((role) => ({ kind: "role" as const, start: role.period.start, role })),
    ...education.map((item) => ({
      kind: "education" as const,
      start: item.period.start,
      education: item,
    })),
  ].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <ol className="relative space-y-10 border-border border-l pl-8">
      {entries.map((entry) =>
        entry.kind === "role" ? (
          <RoleEntry key={entry.role.slug} role={entry.role} view={view} />
        ) : (
          <EducationEntry key={entry.education.slug} education={entry.education} />
        ),
      )}
    </ol>
  );
}

function Marker({ icon: Icon }: { icon: typeof BriefcaseIcon }) {
  return (
    <span
      aria-hidden="true"
      className="-left-12 absolute grid size-8 place-items-center rounded-full border border-border bg-background text-muted-foreground"
    >
      <Icon className="size-4" />
    </span>
  );
}

function RoleEntry({ role, view }: { role: Experience; view: "about" | "resume" }) {
  const bullets = openBullets(role.bullets, view);
  return (
    <li className="relative print-break-inside-avoid">
      <Marker icon={BriefcaseIcon} />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="font-semibold text-lg tracking-tight">
          {role.title} · {role.company}
        </h3>
        <p className="text-muted-foreground text-sm">
          <time dateTime={role.period.start}>
            {role.displayStart ?? formatMonth(role.period.start)}
          </time>{" "}
          –{" "}
          <time dateTime={role.period.end === "present" ? undefined : role.period.end}>
            {formatMonth(role.period.end)}
          </time>{" "}
          · {formatDuration(role.period)}
        </p>
      </div>
      <p className="text-muted-foreground text-sm">{role.location}</p>
      {bullets.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {bullets.map((bullet) => (
            <li key={bullet.text} className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-pretty">{bullet.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-pretty text-sm">{role.summary}</p>
      )}
      {role.stack.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
          {role.stack.map((item) => (
            <li
              key={item}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function EducationEntry({ education }: { education: Education }) {
  return (
    <li className="relative print-break-inside-avoid">
      <Marker icon={GraduationCapIcon} />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="font-semibold text-lg tracking-tight">{education.degree}</h3>
        <p className="text-muted-foreground text-sm">
          <time dateTime={education.period.end}>{education.period.end.slice(0, 4)}</time>
        </p>
      </div>
      <p className="text-muted-foreground text-sm">{education.school}</p>
    </li>
  );
}
