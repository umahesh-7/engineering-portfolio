"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { type NavItem, NavLinks } from "@/components/site/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({ items, name }: { items: NavItem[]; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>{name}</SheetTitle>
        <SheetDescription>Site navigation</SheetDescription>
        <nav aria-label="Mobile">
          <NavLinks
            items={items}
            className="flex-col items-stretch gap-1"
            linkClassName="h-11 w-full text-base"
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
