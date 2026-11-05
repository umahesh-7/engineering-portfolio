import type { Period } from "@/lib/schemas";
import { monthsBetween } from "@/lib/utils";

/** The date used for "present" durations and the years-of-experience figure. Fixed per build for reproducible output. */
export const BUILD_DATE = new Date(process.env.BUILD_DATE ?? new Date().toISOString().slice(0, 10));

export function periodMonths(period: Period): number {
  return monthsBetween(period.start, period.end, BUILD_DATE);
}

export function formatDuration(period: Period): string {
  const total = periodMonths(period);
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

/** Whole years of professional experience, computed from the timeline rather than hard-coded. */
export function yearsOfExperience(periods: Period[]): number {
  const months = periods.reduce((sum, period) => sum + periodMonths(period), 0);
  return Math.floor(months / 12);
}
