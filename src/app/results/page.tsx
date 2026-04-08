import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Results",
  description: "Results section is coming soon on JobAccess."
};

export default function ResultsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="font-[var(--font-heading)] text-3xl">Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Results section is coming soon. We are working on a verified results tracker.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
