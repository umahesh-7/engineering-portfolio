"use client";

import { useEffect } from "react";
import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <p className="font-mono text-destructive text-xs uppercase tracking-[0.2em]">
        Something went wrong
      </p>
      <h1 className="mt-4 font-semibold text-headline tracking-tight">
        This page failed to render
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        The error has been logged{error.digest ? ` (reference ${error.digest})` : ""}. Try again, or
        head back home.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <a href="/">Back home</a>
        </Button>
      </div>
    </Container>
  );
}
