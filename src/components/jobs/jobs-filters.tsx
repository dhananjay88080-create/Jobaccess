import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JobsFiltersProps {
  searchParams: Record<string, string | string[] | undefined>;
  showJobType?: boolean;
}

export function JobsFilters({ searchParams, showJobType = true }: JobsFiltersProps) {
  const current = (key: string) => {
    const value = searchParams[key];
    if (!value) return "";
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <form className="grid gap-3 rounded-xl border bg-card/85 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      <Input type="text" name="q" placeholder="Search jobs..." defaultValue={current("q")} />
      {showJobType ? (
        <select name="jobType" defaultValue={current("jobType")} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All types</option>
          <option value="government">Govt Jobs</option>
          <option value="private">Private Jobs</option>
        </select>
      ) : null}
      <Button type="submit">Apply filters</Button>
    </form>
  );
}
