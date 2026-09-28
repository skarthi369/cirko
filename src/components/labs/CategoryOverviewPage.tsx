import { Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LABS_CATALOG, CATEGORY_INFO } from "@/lib/labs/catalog";
import type { LabCategoryId } from "@/lib/labs/types";

export type CategoryOverviewPageProps = {
  categoryId: LabCategoryId;
};

export default function CategoryOverviewPage({ categoryId }: CategoryOverviewPageProps) {
  const info = CATEGORY_INFO[categoryId];
  const labs = LABS_CATALOG.filter((l) => l.category === categoryId);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground font-mono"
          >
            ← Virtual Labs Catalog
          </Link>
          <span className="text-border">|</span>
          <h1 className="font-mono text-sm font-semibold">{info.title}</h1>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" className="font-mono text-xs">
            Open CircuitLab Editor
          </Button>
        </Link>
      </header>

      {/* Category Hero */}
      <div className="border-b border-border bg-card/60 px-6 py-8">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info.icon}</span>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
              Department Curriculum
            </Badge>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {info.title} Virtual Laboratory
          </h2>
          <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">
            {info.description} Includes complete theoretical manuals, interactive circuit apparatus,
            step-by-step procedure guidance, and verifiable digital completion certificates.
          </p>
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-6 space-y-6">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Laboratory Curriculum ({labs.length} Experiments)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {labs.map((lab) => {
            const isAvailable = lab.status === "available";

            return (
              <Card
                key={lab.id}
                className="flex flex-col justify-between border-border bg-card transition-all hover:border-primary/60 hover:shadow-md"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={isAvailable ? "default" : "secondary"}
                      className="font-mono text-[10px]"
                    >
                      {isAvailable ? "● Live Simulator" : "Manual & Theory"}
                    </Badge>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <span>{lab.difficulty}</span>
                      <span>•</span>
                      <span>{lab.estimatedDuration}</span>
                    </div>
                  </div>

                  <CardTitle className="font-mono text-sm font-bold text-foreground leading-snug">
                    {lab.title}
                  </CardTitle>

                  <CardDescription className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {lab.shortObjective}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>Apparatus:</span>
                      <span>{lab.manual.apparatus.length} Items</span>
                    </div>

                    <Link to={lab.path} className="block w-full">
                      <Button
                        size="sm"
                        variant={isAvailable ? "default" : "outline"}
                        className="w-full font-mono text-xs gap-1.5"
                      >
                        {isAvailable ? "🔬 Start Interactive Lab →" : "📖 Read Lab Manual →"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
