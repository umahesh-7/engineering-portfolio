"use client";

import { ArrowRightIcon, FileTextIcon, FolderKanbanIcon, PenLineIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchItem } from "@/lib/search-index";

const GROUP_ICONS = {
  Pages: FileTextIcon,
  "Case studies": FolderKanbanIcon,
  Writing: PenLineIcon,
} as const;

export default function CommandPaletteDialog({
  items,
  open,
  onOpenChange,
}: {
  items: SearchItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const groups = useMemo(() => {
    const map = new Map<SearchItem["group"], SearchItem[]>();
    for (const item of items) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [items]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, case studies and writing…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {groups.map(([group, groupItems]) => {
          const Icon = GROUP_ICONS[group];
          return (
            <CommandGroup key={group} heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.keywords ?? ""}`}
                  onSelect={() => go(item.href)}
                >
                  <Icon aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                  {item.hint ? (
                    <span className="ml-auto truncate text-muted-foreground text-xs">
                      {item.hint}
                    </span>
                  ) : null}
                  <ArrowRightIcon
                    className="opacity-0 data-[selected=true]:opacity-100"
                    aria-hidden="true"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
