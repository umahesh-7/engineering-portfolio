"use client";

import { type NavItem, NavLinks } from "@/components/site/nav-links";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export default function MobileNavSheet({
  items,
  name,
  open,
  onOpenChange,
  triggerRef,
}: {
  items: NavItem[];
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <SheetTitle>{name}</SheetTitle>
        <SheetDescription>Site navigation</SheetDescription>
        <nav aria-label="Mobile">
          <NavLinks
            items={items}
            className="flex-col items-stretch gap-1"
            linkClassName="h-11 w-full text-base"
            onNavigate={() => onOpenChange(false)}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
