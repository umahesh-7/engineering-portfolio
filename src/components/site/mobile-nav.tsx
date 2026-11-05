"use client";

import { MenuIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { NavItem } from "@/components/site/nav-links";
import { Button } from "@/components/ui/button";

/** The sheet (a Radix dialog) loads on first open so desktop visitors never download it. */
const MobileNavSheet = dynamic(() => import("@/components/site/mobile-nav-sheet"), { ssr: false });

export function MobileNav({ items, name }: { items: NavItem[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="size-11 md:hidden"
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
      >
        <MenuIcon className="size-5" />
      </Button>
      {loaded ? (
        <MobileNavSheet
          items={items}
          name={name}
          open={open}
          onOpenChange={setOpen}
          triggerRef={triggerRef}
        />
      ) : null}
    </>
  );
}
