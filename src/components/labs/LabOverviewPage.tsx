import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import LabManualSection from "@/components/labs/LabManualSection";
import PrePostTestCard from "@/components/labs/PrePostTestCard";
import type { LabMeta } from "@/lib/labs/types";

export type LabOverviewPageProps = {
  lab: LabMeta;
};

export default function LabOverviewPage({ lab }: LabOverviewPageProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [preScore, setPreScore] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground font-mono"
          >
            ← Virtual Labs Catalog
          </Link>
          <span className="text-border">|</span>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-tight">{lab.title}</h1>
            <p className="text-[11px] text-muted-foreground">{lab.categoryTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={lab.status === "available" ? "default" : "secondary"}
            className="font-mono text-xs"
          >
            {lab.status === "available" ? "● Active Simulation" : "Roadmap Phase"}
          </Badge>

          <Link to="/">
            <Button variant="outline" size="sm" className="font-mono text-xs">
              Open CircuitLab
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Header Card */}
      <div className="border-b border-border bg-card/60 px-6 py-5">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
                {lab.categoryTitle}
              </Badge>
              <span className="text-xs text-muted-foreground">• Difficulty: {lab.difficulty}</span>
              <span className="text-xs text-muted-foreground">
                • Duration: {lab.estimatedDuration}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {lab.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {lab.shortObjective}
            </p>
          </div>

          {lab.status === "available" ? (
            <Link to={lab.path as string}>
              <Button className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground">
                🔬 Enter Interactive Lab →
              </Button>
            </Link>
          ) : (
            <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-right">
              <p className="font-mono text-xs font-semibold text-amber-500">
                Under Active Engineering
              </p>
              <p className="text-[10px] text-muted-foreground">Manual & Theory available below</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-border bg-card px-6">
        <div className="mx-auto max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-10 bg-transparent p-0 gap-2">
              <TabsTrigger value="manual">📖 Laboratory Manual</TabsTrigger>
              <TabsTrigger value="pretest">
                ❓ Pre-Test {preScore !== null && `(${preScore}/3)`}
              </TabsTrigger>
              <TabsTrigger value="roadmap">🧭 Implementation Roadmap</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Contents */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          {activeTab === "manual" && (
            <LabManualSection
              manual={lab.manual}
              onProceedToPretest={() => setActiveTab("pretest")}
            />
          )}

          {activeTab === "pretest" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="pretest"
                title={`${lab.title} — Prerequisite Assessment`}
                description="Answer the foundational questions below to verify theoretical readiness before engaging with simulation apparatus."
                questions={lab.manual.preTestQuestions}
                onComplete={(score) => setPreScore(score)}
              />
            </div>
          )}

          {activeTab === "roadmap" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <Alert className="bg-card border-border">
                <AlertTitle className="font-mono text-xs font-bold text-primary">
                  Laboratory Engineering Architecture
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                  This experiment is structured according to the IIT Roorkee Virtual Labs syllabus.
                  The foundational DC circuit editor and MNA linear solver are currently
                  production-ready. Specific physical domain adapters (laser optical power coupling,
                  logic state matrices, and signal processing modulation adapters) are
                  systematically enabled in phased releases.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Reference Curriculum Alignment
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on IIT Roorkee Virtual Laboratory methodology (Ref:{" "}
                  <a
                    href={lab.iitrReferenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-mono"
                  >
                    {lab.iitrReferenceUrl}
                  </a>
                  ). All experiments enforce rigorous scientific workflows: Aim, Theory, Pre-Test,
                  Procedure, Interactive Simulation, Observation Logging, Dynamic Analysis, and
                  Post-Test.
                </p>

                <div className="pt-2">
                  <Link to="/labs/optical-communication/characterization-led">
                    <Button variant="outline" size="sm" className="font-mono text-xs">
                      ← Try Reference Lab: Characterization of LED
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
