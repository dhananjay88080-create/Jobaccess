import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/govt-jobs", label: "Govt Jobs" },
  { href: "/private-jobs", label: "Private Jobs" },
  { href: "/results", label: "Results" },
  { href: "/admit-cards", label: "Admit Cards" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" }
];

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-background/80">
      <div className="container space-y-4 py-8 text-sm text-muted-foreground">
        <p>JobAccess - All Jobs. One Platform</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="underline-offset-4 hover:text-foreground hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
