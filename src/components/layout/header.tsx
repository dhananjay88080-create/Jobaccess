import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/govt-jobs", label: "Govt Jobs" },
    { href: "/private-jobs", label: "Private Jobs" },
    { href: "/results", label: "Results" },
    { href: "/admit-cards", label: "Admit Cards" },
    { href: "/about-us", label: "About Us" },
    { href: "/contact-us", label: "Contact Us" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold leading-none">JobAccess</p>
            <p className="text-xs text-muted-foreground">All Jobs. One Platform</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/admin/login">Admin</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
