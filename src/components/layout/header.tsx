"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/govt-jobs", label: "Govt Jobs" },
    { href: "/private-jobs", label: "Private Jobs" },
    { href: "/blogs", label: "Blogs" },
    { href: "/about-us", label: "About Us" },
    { href: "/contact-us", label: "Contact Us" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container relative flex h-16 items-center justify-between">
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
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((old) => !old)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
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

        {mobileMenuOpen ? (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-lg border bg-card p-2 shadow-lg md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Button key={item.href} asChild variant="ghost" className="justify-start">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/admin/login">Admin</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
