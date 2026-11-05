import { CommandPalette } from "@/components/site/command-palette";
import { Container } from "@/components/site/container";
import { Logo } from "@/components/site/logo";
import { MobileNav } from "@/components/site/mobile-nav";
import { type NavItem, NavLinks } from "@/components/site/nav-links";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { hasWriting, site } from "@/lib/content";
import { getSearchIndex } from "@/lib/search-index";

export function Header() {
  const showWriting = hasWriting();
  const items: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Case studies", href: "/projects" },
    { label: "About", href: "/about" },
    ...(showWriting ? [{ label: "Writing", href: "/writing" }] : []),
    { label: "Contact", href: "/contact" },
  ];
  const searchItems = getSearchIndex().filter((item) => showWriting || item.href !== "/writing");

  return (
    <header className="print:hidden sticky top-0 z-40 border-border/70 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo initials={site.initials} name={site.name} />
        <nav aria-label="Primary" className="hidden md:block">
          <NavLinks items={items} />
        </nav>
        <div className="flex items-center gap-1">
          <CommandPalette items={searchItems} />
          <ThemeToggle />
          <MobileNav items={items} name={site.name} />
        </div>
      </Container>
    </header>
  );
}
