"use client";

import { useEffect, useState } from "react";

type State = { status: "loading" } | { status: "ready"; views: number } | { status: "disabled" };

/**
 * Reads and increments the view count through the public API so the page itself stays fully static.
 * Shows a neutral dash when counting is disabled (no Redis configured) or unavailable.
 */
export function ViewCounter({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const key = `viewed:${slug}`;
    const alreadyCounted = (() => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    })();

    fetch(`/api/v1/views/${encodeURIComponent(slug)}`, {
      method: alreadyCounted ? "GET" : "POST",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { views: number | null };
        if (data.views === null) {
          setState({ status: "disabled" });
          return;
        }
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          /* storage unavailable */
        }
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
