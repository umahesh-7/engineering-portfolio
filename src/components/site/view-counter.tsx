"use client";

import { useEffect, useState } from "react";

type State = { status: "loading" } | { status: "ready"; views: number } | { status: "disabled" };

const DISABLED_KEY = "views:disabled";

/**
 * Reads and increments the view count through the public API so the page itself stays fully static.
 * Counts once per session per page, remembers when counting is disabled (no Redis configured) so it
 * stops sending increments, and shows a neutral dash when unavailable.
 */
export function ViewCounter({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const seenKey = `viewed:${slug}`;
    const read = (key: string) => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    };
    const write = (key: string) => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* storage unavailable */
      }
    };
    const increment = !read(seenKey) && !read(DISABLED_KEY);

    fetch(`/api/v1/views/${slug}`, {
      method: increment ? "POST" : "GET",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { views: number | null };
        if (data.views === null) {
          write(DISABLED_KEY);
          setState({ status: "disabled" });
          return;
        }
        write(seenKey);
        setState({ status: "ready", views: data.views });
      })
      .catch(() => setState({ status: "disabled" }));

    return () => controller.abort();
  }, [slug]);

  if (state.status === "loading") {
    return (
      <>
        <span
          className="inline-block h-4 w-8 animate-pulse rounded bg-muted align-middle"
          aria-hidden="true"
        />
        <span className="sr-only">Loading view count</span>
      </>
    );
  }
  if (state.status === "disabled") {
    return (
      <span>
        —<span className="sr-only"> view count unavailable</span>
      </span>
    );
  }
  return <span>{new Intl.NumberFormat("en-US").format(state.views)}</span>;
}
