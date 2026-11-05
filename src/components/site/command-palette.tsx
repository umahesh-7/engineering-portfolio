"use client";

import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { SearchItem } from "@/lib/search-index";

/** The dialog (cmdk and its dependencies) loads on first open so it stays out of every page's initial bundle. */
const CommandPaletteDialog = dynamic(() => import("@/components/site/command-palette-dialog"), {
  ssr: false,
});

export function CommandPalette({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const show = () => {
    setLoaded(true);
    setOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLoaded(true);
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 text-muted-foreground md:inline-flex"
        onClick={show}
        aria-keyshortcuts="Meta+K Control+K"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
        <span className="text-xs">Search</span>
        <span className="sr-only">, open the command palette</span>
        <Kbd aria-hidden="true">⌘K</Kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={show}>
        <SearchIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Search, open the command palette</span>
      </Button>
      {loaded ? <CommandPaletteDialog items={items} open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
