import Link from "next/link";
import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-mono text-primary text-xs uppercase tracking-[0.2em]">404</p>
      <h1 className="mt-4 font-semibold text-headline tracking-tight">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        The page may have moved, or the link was mistyped. The case studies and the about page cover
        most of what lives here.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">Case studies</Link>
        </Button>
      </div>
    </Container>
  );
}
