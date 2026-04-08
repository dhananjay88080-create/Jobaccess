import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center">
      <h1 className="font-[var(--font-heading)] text-3xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you requested does not exist or may have been moved.</p>
      <Button asChild>
        <Link href="/">Go to homepage</Link>
      </Button>
    </div>
  );
}
