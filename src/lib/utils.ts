import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Formats "2024-07" as "Jul 2024", "2024" as "2024" and "present" as "Present". */
export function formatMonth(value: string): string {
  if (value === "present") return "Present";
  const [year, month] = value.split("-");
  if (!year) return value;
  if (!month) return year;
  const index = Number(month) - 1;
  const label = MONTHS[index];
  return label ? `${label} ${year}` : year;
}

/** Formats an ISO date (YYYY-MM-DD) for a US audience, e.g. "November 5, 2026". */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Months between two "YYYY-MM" values (end may be "present", resolved against `now`). */
export function monthsBetween(start: string, end: string, now: Date): number {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] =
    end === "present" ? [now.getUTCFullYear(), now.getUTCMonth() + 1] : end.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return 0;
  return Math.max(0, (ey - sy) * 12 + (em - sm) + 1);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function absoluteUrl(path: string, base: string): string {
  return new URL(path, base).toString();
}
