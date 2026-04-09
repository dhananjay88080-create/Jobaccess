import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JobsFiltersProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export function JobsFilters({ searchParams }: JobsFiltersProps) {
  const current = (key: string) => {
    const value = searchParams[key];
    if (!value) return "";
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <form className="grid gap-3 rounded-xl border bg-card/85 p-4 shadow-sm sm:grid-cols-[1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:hidden" />
        <Input className="pl-9 sm:pl-3" type="text" name="q" placeholder="Search jobs..." defaultValue={current("q")} />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
