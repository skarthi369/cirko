import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABS_CATALOG, CATEGORY_INFO } from "@/lib/labs/catalog";
import type { LabCategoryId } from "@/lib/labs/types";

export const Route = createFileRoute("/labs/")({
  head: () => ({
    meta: [
      { title: "Virtual Labs Platform — CirkitLab" },
      {
        name: "description",
        content:
          "University-grade virtual laboratory experiments inspired by IIT Roorkee methodology: Optical Communication, Digital Electronics, and Communication Systems.",
      },
    ],
  }),
  component: LabsIndexPage,
});

export default function LabsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<LabCategoryId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: LabCategoryId[] = [
    "optical-communication",
    "digital-electronics",
    "communication-systems",
  ];

  const filteredLabs = LABS_CATALOG.filter((lab) => {
    const matchesCat = selectedCategory === "all" || lab.category === selectedCategory;
    const matchesQuery =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.shortObjective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded bg-primary font-mono text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-mono text-sm font-bold">CirkitLab</span>
          </Link>
          <span className="text-border">|</span>
          <h1 className="font-mono text-sm font-semibold">Virtual Engineering Labs Platform</h1>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" className="font-mono text-xs">
            ← Open Circuit Editor
          </Button>
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="border-b border-border bg-card/60 px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
              IIT Roorkee Curriculum Model
            </Badge>
            <span className="text-xs text-muted-foreground">
              3 Disciplines · 9 Laboratory Experiments
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground font-mono">
            Interactive Virtual Laboratories
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
            Perform rigorous, university-level engineering experiments inside your browser. Every
            lab integrates an authoritative manual, guided procedure state machine, 3-attempt hint
            system, real physical circuit simulation, observation tables, dynamic Recharts plotting,
            and verifiable completion certificates.
          </p>

          {/* Filter and Search Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="font-mono text-xs h-8"
              >
                All Disciplines ({LABS_CATALOG.length})
              </Button>

              {categories.map((catKey) => {
                const info = CATEGORY_INFO[catKey];
                const count = LABS_CATALOG.filter((l) => l.category === catKey).length;
                return (
                  <Button
                    key={catKey}
                    size="sm"
                    variant={selectedCategory === catKey ? "default" : "outline"}
                    onClick={() => setSelectedCategory(catKey)}
                    className="font-mono text-xs h-8 gap-1.5"
                  >
                    <span>{info.icon}</span>
                    <span>{info.title}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </Button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search experiments…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 font-mono text-xs bg-sidebar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Listing */}
      <main className="mx-auto w-full max-w-6xl flex-1 p-6 sm:p-8 space-y-10">
        {categories.map((catKey) => {
          const info = CATEGORY_INFO[catKey];
          const labsInCat = filteredLabs.filter((l) => l.category === catKey);
          if (labsInCat.length === 0) return null;

          return (
            <section key={catKey} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{info.icon}</span>
                  <div>
                    <h3 className="font-mono text-base font-bold text-foreground tracking-tight">
                      {info.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>

                <Badge variant="outline" className="font-mono text-xs">
                  {labsInCat.length} Experiment{labsInCat.length > 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Experiment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {labsInCat.map((lab) => {
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
                            <span>{lab.manual.apparatus.length} Components</span>
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
            </section>
          );
        })}
      </main>
    </div>
  );
}
