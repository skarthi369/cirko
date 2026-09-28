import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { LabManualData } from "@/lib/labs/types";

export type LabManualSectionProps = {
  manual: LabManualData;
  onProceedToPretest?: () => void;
};

export default function LabManualSection({ manual, onProceedToPretest }: LabManualSectionProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 1. Aim */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <span>Section 1</span>
            <span>•</span>
            <span>Laboratory Objective</span>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Aim of the Experiment
          </CardTitle>
          <CardDescription className="text-sm text-foreground/90 font-medium leading-relaxed pt-1">
            {manual.aim}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 2. Theory & Equations */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <span>Section 2</span>
            <span>•</span>
            <span>Fundamental Theory</span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Theoretical Principles & Electronic Physics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>{manual.theory.overview}</p>

          <div className="space-y-2 border-l-2 border-primary/50 pl-3">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">
              Key Physical Insights:
            </h4>
            <ul className="space-y-1 text-xs">
              {manual.theory.keyPoints.map((pt, i) => (
                <li key={i} className="list-disc list-inside">
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Equations */}
          {manual.theory.equations.length > 0 && (
            <div className="rounded-lg border border-border bg-sidebar/50 p-4 space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                Mathematical Formulations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {manual.theory.equations.map((eq, i) => (
                  <div key={i} className="rounded border border-border bg-card p-3 space-y-1">
                    <p className="font-mono text-[11px] font-semibold text-muted-foreground">
                      {eq.title}
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground py-0.5">
                      {eq.formula}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{eq.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Apparatus Required */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <span>Section 3</span>
            <span>•</span>
            <span>Equipment Specification</span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Apparatus Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-sidebar">
                <TableRow>
                  <TableHead className="h-8 text-xs font-mono">Item</TableHead>
                  <TableHead className="h-8 text-xs font-mono">Equipment Name</TableHead>
                  <TableHead className="h-8 text-xs font-mono">Specification / Rating</TableHead>
                  <TableHead className="h-8 text-xs font-mono text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manual.apparatus.map((item, idx) => (
                  <TableRow key={idx} className="h-8 text-xs">
                    <TableCell className="py-1 font-mono text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="py-1 font-semibold text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-1 text-muted-foreground">
                      {item.specification}
                    </TableCell>
                    <TableCell className="py-1 font-mono text-right text-primary font-bold">
                      {item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. Circuit Setup & Procedure */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <span>Section 4</span>
            <span>•</span>
            <span>Experimental Procedure</span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Step-by-Step Laboratory Procedure
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {manual.circuitSetupDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            {manual.procedureSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-primary font-bold shrink-0">{idx + 1}.</span>
                <span>{step.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* 5. References */}
      {manual.references.length > 0 && (
        <Card className="bg-card border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold tracking-tight text-foreground">
              Academic References & Textbooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {manual.references.map((ref, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-primary font-mono">•</span>
                  <span>{ref.title}</span>
                  {ref.author && (
                    <span className="italic text-muted-foreground">— {ref.author}</span>
                  )}
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline ml-1 font-mono text-[11px]"
                    >
                      [IITR Link ↗]
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Bottom Nav Button */}
      {onProceedToPretest && (
        <div className="flex justify-end pt-2 pb-6">
          <Button onClick={onProceedToPretest} className="font-mono text-xs gap-1.5">
            Proceed to Pre-Test Assessment →
          </Button>
        </div>
      )}
    </div>
  );
}
