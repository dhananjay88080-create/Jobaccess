import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="font-[var(--font-heading)] text-3xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="whitespace-pre-line text-foreground">{children}</CardContent>
      </Card>
    </div>
  );
}
