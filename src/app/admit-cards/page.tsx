import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admit Cards",
  description: "Admit Cards section is coming soon on JobAccess."
};

export default function AdmitCardsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="font-[var(--font-heading)] text-3xl">Admit Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Admit cards section is coming soon. We are building this module right now.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
